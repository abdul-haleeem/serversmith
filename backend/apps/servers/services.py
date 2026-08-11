import paramiko

class SSHService:
    def __init__(self, server):
        self.server = server

    def test_connection(self):
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            client.connect(
                hostname=self.server.ip_address,
                port=self.server.ssh_port,
                username=self.server.ssh_username,
                password=self.server.ssh_password,
                timeout=5,
            )
            return {"success": True, "message": "Connection successful"}
        except paramiko.AuthenticationException:
            return {"success": False, "message": "Authentication failed - check username/password"}
        except Exception as e:
            return {"success": False, "message": f"Connection failed: {str(e)}"}
        finally:
            client.close()

    def execute_command(self, command):
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            client.connect(
                hostname=self.server.ip_address,
                port=self.server.ssh_port,
                username=self.server.ssh_username,
                password=self.server.ssh_password,
                timeout=5,
            )
            stdin, stdout, stderr = client.exec_command(command)
            output = stdout.read().decode()
            error = stderr.read().decode()
            exit_code = stdout.channel.recv_exit_status()

            return {
                "success": True,
                "output": output,
                "error": error,
                "exit_code": exit_code,
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "exit_code": None,
            }
        finally:
            client.close()

    #for getting monitoring commnads results

    def get_metrics(self):
        mem_result = self.execute_command("free -m")
        disk_result = self.execute_command("df -h /")
        uptime_result = self.execute_command("uptime -p")

        return {
            "memory": self._parse_memory(mem_result["output"]),
            "disk": self._parse_disk(disk_result["output"]),
            "uptime": uptime_result["output"].strip(),
        }

    #for parsing the outputs of monitoring commands (memory and disk)

    def _parse_memory(self, output):
        lines = output.strip().split("\n")
        for line in lines:
            if line.startswith("Mem:"):
                parts = line.split()
                total = int(parts[1])
                used = int(parts[2])
                percent = round((used / total) * 100, 1) if total > 0 else 0
                return {"total_mb": total, "used_mb": used, "percent": percent}
        return None

    def _parse_disk(self, output):
        lines = output.strip().split("\n")
        if len(lines) < 2:
            return None
        parts = lines[1].split()
        return {
            "total": parts[1],
            "used": parts[2],
            "available": parts[3],
            "percent": parts[4],
        }