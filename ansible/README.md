# VM deployment

This playbook represents the legacy deployment path used in the migration project. It installs Docker and Nginx, runs the application container under systemd, and keeps the container bound to localhost behind Nginx.

Copy the inventory file, point it at an Ubuntu host, and set the image tag in `group_vars/all.yml` before running it.

```bash
cp inventory.example.ini inventory.ini
ansible-playbook -i inventory.ini deploy.yml
```

The Kubernetes/Helm deployment is the target state. The VM path remains available for cutover validation and rollback during the migration.
