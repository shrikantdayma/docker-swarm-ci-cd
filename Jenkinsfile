pipeline {
agent any

environment {
    // Use the current build number as the image tag
    TAG = "${env.BUILD_NUMBER}"
    DOCKERHUB_USERNAME = 'shrikantdayma'
    DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
    APP_NAME = 'swarm-app'
}

stages {
    stage('Declarative: Checkout SCM') {
        steps {
            checkout scm
        }
    }

    stage('Preparation & Verification') {
        steps {
            echo "Starting Swarm CI/CD pipeline..."
            sh 'ls -R'
        }
    }

    stage('Install & Test') {
        steps {
            echo "Installing dependencies and running tests directly on Agent shell."
            sh 'npm install'
            sh 'npm test'
        }
    }

    stage('Build Docker Image') {
        steps {
            echo "Building Docker image: ${DOCKERHUB_USERNAME}/${APP_NAME}:${TAG}"
            sh "docker build -t ${DOCKERHUB_USERNAME}/${APP_NAME}:${TAG} ."
        }
    }

    stage('Push to Docker Hub') {
        steps {
            echo "Pushing image to ${DOCKERHUB_USERNAME}..."
            withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", passwordVariable: 'DOCKER_PSW', usernameVariable: 'DOCKER_USER')]) {
                sh """
                    echo $DOCKER_PSW | docker login -u $DOCKER_USER --password-stdin
                    docker push ${DOCKERHUB_USERNAME}/${APP_NAME}:${TAG}
                """
            }
        }
    }

    stage('Deploy to Docker Swarm') {
        steps {
            echo "Deploying stack: app-stack with image ${DOCKERHUB_USERNAME}/${APP_NAME}:${TAG}"
            // FIX: This command pipes the substituted content directly to Docker deploy.
            sh """
                export TAG=${TAG}
                envsubst < docker-compose-deploy.yml | docker stack deploy -c - --with-registry-auth app-stack
            """
        }
    }
}

post {
    always {
        echo "Pipeline finished. Build status: ${currentBuild.result}"
        script {
            if (currentBuild.result == 'SUCCESS') {
                echo "✅ Deployment SUCCESSFUL. View your application on port 8081."
            } else {
                echo "❌ Deployment FAILED. Check console log for errors."
            }
        }
    }
}

}
