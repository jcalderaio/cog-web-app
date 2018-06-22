#!/usr/bin/env groovy

pipeline {
    environment {
        CI = true
    }

    agent none

    stages {
        stage('Build') {
            agent any
            steps {
                milestone 1
                echo "Building $env.BRANCH_NAME $env.BUILD_NUMBER"
                // use node v8.10.0
                // nvm('v8.10.0') {
                sh 'rm -rf ./node_modules package-lock.json'
                sh "echo '//registry.npmjs.org/:_authToken=$NPM_TOKEN' > .npmrc"
                sh 'npm install'
                sh "npm run lint"
                sh "npm test"
                script {
                    def commit_id = sh (script: 'git rev-parse --short HEAD', returnStdout: true).trim();
                    def timestamp = sh (script: 'date +"%Y%m%d_%H%M%S"', returnStdout: true).trim();

                    sh "sed -i 's/local/${commit_id}/' ./package.json"
                    sh "npm run build --scripts-prepend-node-path"
                    sh "zip -r hie-datavis.${timestamp}.${commit_id}.zip build"
                    // archiveArtifacts artifacts: 'hie-datavis.${timestamp}.${commit_id}.zip'
                    sh "aws s3 cp hie-datavis.${timestamp}.${commit_id}.zip s3://cgs-artifacts/esante/hie/datavis/hie-datavis.${timestamp}.${commit_id}.zip"
                    sh "echo hie-datavis.${timestamp}.${commit_id}.zip > deploy_package.txt"
                    stash includes: 'deploy_package.txt', name: 'deploy_package_info'

                    // get version and build number, put in publish_version.txt for future step that tags release in github
                    def npmVersion = sh (script: 'cat ./package.json | jq ".version"', returnStdout: true).trim().replace("\"","");
                    def publishVersion = "${npmVersion}+${BUILD_NUMBER}";
                    sh "echo ${publishVersion} > publish_version.txt"
                    stash includes: 'publish_version.txt', name: 'publish_version'
                }
                // }
                sh "echo 'Build Completed'"
            }
            post {
                always {
                    deleteDir()
                    // sh "echo 'post'"
                }
            }
        }

        stage('Deploy to DEV') {
            agent any
            steps {
                milestone 2
                unstash 'deploy_package_info'
                script {
                    def deployPackage = readFile('deploy_package.txt').trim()
                    sh "echo Starting deployment $deployPackage ..."
                    sh "sh ./install.sh -e dev -p $deployPackage"
                    sh "echo Deployed to DEV completed"
                }
            }
            post {
                always {
                    deleteDir()
                }
            }
        }

        stage('Confirm QA') {
            agent none
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input 'Deploy to QA?'
                }
            }
        }

        stage('Tag build in Git'){
            agent any
            steps {
                milestone 3
                unstash 'publish_version'
                script {
                    def publishVersion = readFile('publish_version.txt').trim();
                    sh "git tag ${publishVersion}"
                    sshagent(["${SSH_AGENT_CREDENTIALS}"]) {
                        sh "git push origin ${publishVersion}"
                    }
                }
            }
        }

        stage('Deploy to QA') {
            agent any
            steps {
                milestone 4
                unstash 'deploy_package_info'
                script {
                    def deployPackage = readFile('deploy_package.txt').trim()
                    sh "echo Starting deployment $deployPackage ..."
                    sh "sh ./install.sh -e qa -p $deployPackage"
                    sh "echo Deployed to QA completed"
                }
            }
            post {
                always {
                    deleteDir()
                }
            }
        }

        stage('Confirm STAGE') {
            agent none
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    input 'Deploy to STAGE?'
                }
            }
        }

        stage('Deploy to STAGE') {
            agent any
            steps {
                milestone 5
                unstash 'deploy_package_info'
                script {
                    def deployPackage = readFile('deploy_package.txt').trim()
                    sh "echo Starting deployment $deployPackage ..."
                    sh "sh ./install.sh -e stage -p $deployPackage"
                    sh "echo Deployed to STAGE completed"
                }
            }
            post {
                always {
                    deleteDir()
                }
            }
        }
    }
}
