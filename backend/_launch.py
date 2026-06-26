import subprocess, sys, os
os.chdir(r"C:\shahrukh\welovepdf\backend")
with open("uvicorn.log", "ab") as log:
    p = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=log, stderr=log,
        creationflags=getattr(subprocess, "DETACHED_PROCESS", 0) | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0),
        close_fds=True,
    )
print(p.pid)
