from django.utils import timezone
from apps.servers.services import SSHService

class DeploymentService:
    def __init__(self, deployment):
        self.deployment = deployment

    def run(self):
        deployment = self.deployment
        deployment.status = deployment.RUNNING
        deployment.save()

        container_name = f"deploy-{deployment.project.id}-{deployment.id}"
        service = SSHService(deployment.server)

        commands = [
            f"docker rm -f {container_name} 2>/dev/null || true",
            f"docker run -d --name {container_name} -p 0:80 nginx",
        ]

        log_lines = []
        success = True

        for cmd in commands:
            result = service.execute_command(cmd)
            log_lines.append(f"$ {cmd}")
            log_lines.append(result["output"] or result["error"])
            if result["exit_code"] not in (0, None) and "docker rm" not in cmd:
                success = False
                break

        deployment.logs = "\n".join(log_lines)
        deployment.status = deployment.SUCCESS if success else deployment.FAILED
        deployment.finished_at = timezone.now()
        deployment.save()