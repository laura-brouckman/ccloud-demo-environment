from subprocess import Popen
import signal

NUM_DRIVERS = 15

if __name__ == '__main__':
    # For each vehicle, spawn a subprocess that will track its location
    processes = []
    for i in range(NUM_DRIVERS):
        print("Starting vehicle ", str(i + 1))
        p = Popen(["python", "vehicle.py", str(i + 1)], stdout=None)
        processes.append(p)

    def exit_handler(a,b):
        exit(0)

    signal.signal(signal.SIGINT, exit_handler)
    signal.pause()
    

