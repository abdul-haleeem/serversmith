from django.utils import timezone
from apps.servers.services import SSHService

class DeploymentService:
    def __init__(self, deployment):
        self.deployment = deployment

    def run(self):
        deployment = self.deployment
        deployment.status = deployment.RUNNING
        deployment.save()

        project = deployment.project
        container_name = f"deploy-{project.id}-{deployment.id}"
        clone_dir = f"/tmp/{container_name}"
        image_name = f"serversmith-{project.id}"
        app_port = project.port

        service = SSHService(deployment.server)

        commands = [
            f"docker rm -f {container_name} 2>/dev/null || true",
            f"rm -rf {clone_dir}",
            f"git clone --depth 1 {project.repository_url} {clone_dir}",
            f"docker build -t {image_name} {clone_dir}",
            f"docker run -d --name {container_name} -p 0:{app_port} {image_name}",
        ]

        log_lines = []
        success = True
        safe_to_fail = ["docker rm", "rm -rf"]

        for cmd in commands:
            result = service.execute_command(cmd)
            log_lines.append(f"$ {cmd}")
            log_lines.append(result["output"] or result["error"])
            is_safe = any(marker in cmd for marker in safe_to_fail)
            if result["exit_code"] not in (0, None) and not is_safe:
                success = False
                break

        deployment.logs = "\n".join(log_lines)
        deployment.status = deployment.SUCCESS if success else deployment.FAILED
        deployment.finished_at = timezone.now()
        deployment.save()