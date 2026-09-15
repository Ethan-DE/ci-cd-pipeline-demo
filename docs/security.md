# Security notes

The CI pipeline treats HIGH and CRITICAL image findings as failures and runs Trivy against the Terraform and Helm configuration.

The runtime container uses a non-root user, drops package managers that are not needed by the application, and is deployed with a read-only filesystem and dropped Linux capabilities in Kubernetes.

The EKS API endpoint is private by default. Public API access can be enabled when required, but the caller must also supply the CIDR ranges that are allowed to reach it.

There is one Trivy waiver in `.trivyignore`: the upstream EKS module's recommended worker-node security group allows outbound traffic. This project keeps that behavior because nodes need outbound access through the NAT gateway for image pulls and AWS APIs. The waiver is limited to that check rather than lowering the scan severity or disabling the scanner.
