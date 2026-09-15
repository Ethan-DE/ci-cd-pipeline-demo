pipeline {
  agent any

  stages {
    stage('Check') {
      steps {
        sh 'npm --prefix app run check'
      }
    }

    stage('Test') {
      steps {
        sh '''
          APP_VERSION=${BUILD_NUMBER} node app/server.js > /tmp/status-api.log 2>&1 &
          echo $! > /tmp/status-api.pid
          for i in $(seq 1 20); do
            curl -fsS http://127.0.0.1:3000/ready && break
            sleep 1
          done
          npm --prefix app test
          ./scripts/smoke.sh
        '''
      }
      post {
        always {
          sh 'kill "$(cat /tmp/status-api.pid)" 2>/dev/null || true'
        }
      }
    }

    stage('Container') {
      steps {
        sh 'docker build -t status-api:${BUILD_NUMBER} .'
        sh 'docker run -d --rm --name status-api-${BUILD_NUMBER} -p 3000:3000 status-api:${BUILD_NUMBER}'
        sh './scripts/smoke.sh'
      }
      post {
        always {
          sh 'docker rm -f status-api-${BUILD_NUMBER} 2>/dev/null || true'
        }
      }
    }
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }
}
