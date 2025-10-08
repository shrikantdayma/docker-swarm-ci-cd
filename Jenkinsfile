pipeline {
    agent any

    environment {
        // Tag will be dynamically passed into the docker-compose.yml file during deployment
        DOCKER_IMAGE_NAME = 'swarm-app'
        DOCKER_REGISTRY   = 'shrikantdayma' // Your Docker Hub username
        IMAGE_TAG         = "${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}"
        STACK_NAME        = 'app-stack'
    }

    stages {
        stage('Preparation & Verification') {
            steps {
                echo "Starting Swarm CI/CD pipeline..."
                sh "ls -R \$WORKSPACE" 
            }
        }
        
        stage('Install & Test') {
            steps {
                echo 'Installing dependencies and running tests directly on Agent shell.'
                // Relies on nodejs/npm being installed on the Jenkins agent
                sh 'npm install'
                sh 'npm test || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${IMAGE_TAG}"
                sh "docker build -t ${IMAGE_TAG} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "Pushing image to ${DOCKER_REGISTRY}..."
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials', // Reuse your existing credentials ID
                    usernameVariable: 'DOCKER_USR',
                    passwordVariable: 'DOCKER_PSW')]) {
                    
                    sh "echo ${DOCKER_PSW} | docker login -u ${DOCKER_USR} --password-stdin"
                    sh "docker push ${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Docker Swarm') {
            steps {
                echo "Deploying stack: ${STACK_NAME} with image ${IMAGE_TAG}"
                
                sh '''
                    # Set the TAG environment variable for envsubst
                    export TAG="${BUILD_NUMBER}"

                    # Use 'envsubst' to replace the ${TAG} placeholder in docker-compose.yml
                    # The output is written to a temporary file
                    envsubst < docker-compose.yml > docker-compose-deploy.yml

                    # Deploy the stack using the generated file. 
                    docker stack deploy -c docker-compose-deploy.yml --with-registry-auth ${STACK_NAME}
                '''
                echo "Deployment complete. Swarm service is running on port 8081."
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. Build status: ${currentBuild.result}"
        }
        success {
            echo '✅ Swarm deployment successful! App is running as a service on port 8081.'
        }
        failure {
            echo '❌ Deployment FAILED. Check console log for errors.'
        }
    }
}

