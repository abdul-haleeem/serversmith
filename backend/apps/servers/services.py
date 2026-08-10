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