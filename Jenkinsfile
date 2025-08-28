pipeline {
  agent any
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install') { steps { dir('app'){ sh 'npm ci || npm install' } } }
    stage('Unit Test') {
      steps {
        sh 'nohup node app/server.js & echo $! > app.pid; sleep 1'
        dir('app'){ sh 'npm test' }
      }
      post { always { sh 'kill $(cat app.pid) || true' } }
    }
    stage('Docker Build') { steps { sh 'docker build -t hello-ci:latest .' } }
  }
  options { timestamps() }
}
