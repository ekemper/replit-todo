import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

// Configuration (you would load these from Pulumi configuration in a real deployment)
const config = new pulumi.Config();
const projectName = config.get("projectName") || "todo-app";
const gcpProject = config.get("gcpProject") || "your-gcp-project-id"; // Replace with your actual GCP project ID
const gcpRegion = config.get("gcpRegion") || "us-central1";
const imageTag = config.get("imageTag") || "latest";
const dbInstanceName = config.get("dbInstanceName") || "todo-db-instance";
const dbName = config.get("dbName") || "todoapp";
const dbUsername = config.get("dbUsername") || "todouser";
const dbPassword = config.getSecret("dbPassword") || "changeme"; // Get password from Pulumi config

// Create a GCP Artifact Registry repository for storing the container image
const repository = new gcp.artifactregistry.Repository("todo-app-repo", {
    repositoryId: `${projectName}-repo`,
    format: "DOCKER",
    location: gcpRegion,
    description: "Docker repository for Todo application"
});

// Build and push the Docker image to Artifact Registry
const imageName = pulumi.interpolate`${gcpRegion}-docker.pkg.dev/${gcpProject}/${repository.repositoryId}/${projectName}:${imageTag}`;

const image = new docker.Image("todo-app-image", {
    imageName: imageName,
    build: {
        context: "..",  // Relative to this directory (pulumi)
        dockerfile: "../Dockerfile",
    },
    registry: {
        server: pulumi.interpolate`${gcpRegion}-docker.pkg.dev`,
        username: "oauth2accesstoken",
        password: pulumi.output(gcp.container.getRegistryImage({
            name: imageName,
        })).then(ri => ri.dockerCredentials.password),
    },
});

// Create a Cloud SQL PostgreSQL instance
const sqlInstance = new gcp.sql.DatabaseInstance("todo-db", {
    region: gcpRegion,
    databaseVersion: "POSTGRES_15",
    settings: {
        tier: "db-f1-micro",
        ipConfiguration: {
            authorizedNetworks: [{
                name: "all",
                value: "0.0.0.0/0",
            }],
        },
    },
    deletionProtection: false, // Set to true for production
});

// Create the database
const database = new gcp.sql.Database("todo-database", {
    name: dbName,
    instance: sqlInstance.name,
});

// Create the database user
const dbUser = new gcp.sql.User("todo-db-user", {
    name: dbUsername,
    instance: sqlInstance.name,
    password: dbPassword, // Using password from Pulumi config
});

// Create a service account for the Cloud Run service
const serviceAccount = new gcp.serviceaccount.Account("todo-app-sa", {
    accountId: "todo-app-sa",
    displayName: "Service Account for Todo App",
});

// Grant the service account the necessary permissions
const serviceAccountIamBinding = new gcp.projects.IAMBinding("todo-app-sa-binding", {
    members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
    role: "roles/cloudsql.client",
    project: gcpProject,
});

// Define the Cloud Run service
const service = new gcp.cloudrun.Service("todo-app", {
    location: gcpRegion,
    template: {
        spec: {
            serviceAccountName: serviceAccount.email,
            containers: [{
                image: image.imageName,
                ports: [{
                    containerPort: 8080,
                }],
                resources: {
                    limits: {
                        memory: "512Mi",
                        cpu: "1000m",
                    },
                },
                envs: [
                    {
                        name: "NODE_ENV",
                        value: "production",
                    },
                    {
                        name: "DATABASE_URL",
                        value: pulumi.interpolate`postgres://${dbUsername}:${dbPassword}@${sqlInstance.publicIpAddress}:5432/${dbName}`,
                    },
                    {
                        name: "PGHOST",
                        value: sqlInstance.publicIpAddress,
                    },
                    {
                        name: "PGUSER",
                        value: dbUsername,
                    },
                    {
                        name: "PGPASSWORD",
                        value: dbPassword, // Using password from Pulumi config
                    },
                    {
                        name: "PGDATABASE",
                        value: dbName,
                    },
                    {
                        name: "PGPORT",
                        value: "5432",
                    },
                ],
            }],
        },
    },
});

// Allow unauthenticated access to the Cloud Run service
const serviceIamPolicy = new gcp.cloudrun.IamPolicy("todo-app-policy", {
    location: service.location,
    project: gcpProject,
    service: service.name,
    bindings: [{
        role: "roles/run.invoker",
        members: ["allUsers"],
    }],
});

// Export the Cloud Run service URL
export const serviceUrl = service.statuses.apply(statuses => statuses[0]?.url);
// Export the Cloud SQL instance connection name
export const instanceConnectionName = sqlInstance.connectionName;
// Export the database URL (for reference)
export const databaseUrl = pulumi.interpolate`postgres://${dbUsername}:${dbPassword}@${sqlInstance.publicIpAddress}:5432/${dbName}`;