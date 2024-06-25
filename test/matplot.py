import json
import matplotlib.pyplot as plt

# Load the simulated data
# with open("simulation.json", "r") as file:
#     data = json.load(file)

data = {
    "num_bidders": [3, 5, 7, 15, 25, 29],
    "publish_times": [45.6, 42.6, 42.9, 43.2, 46.2, 46.5],
    "bid_times": [35.7, 32.7, 35.4, 28.2, 32.1, 33.9],
    "open_times": [72.4, 104.5, 135.7, 265.5, 404.7, 482.4],
    "verify_times": [60.3, 65.4, 57.4, 63.6, 59.4, 60.1],
    "finish_times": [60.9, 77.3, 107.8, 195.2, 297.5, 319.9],
    "total_times": [274.9, 322.5, 379.2, 595.7, 839.9, 942.8]
  }
  
num_bidders = data["num_bidders"]
publish_times = data["publish_times"]
bid_times = data["bid_times"]
open_times = data["open_times"]
verify_times = data["verify_times"]
finish_times = data["finish_times"]
total_times = data["total_times"]

# Create subplots
fig, ax = plt.subplots(3, 2, figsize=(12, 9))

# Plot Publish Time
ax[0, 0].plot(num_bidders, publish_times, marker='o', color='blue')
ax[0, 0].set_title('Publish Time')
ax[0, 0].set_xlabel('Number of Bidders')
ax[0, 0].set_ylabel('Time (ms)')

# Plot Bid Time
ax[0, 1].plot(num_bidders, bid_times, marker='o', color='green')
ax[0, 1].set_title('Bid Time')
ax[0, 1].set_xlabel('Number of Bidders')
ax[0, 1].set_ylabel('Time (ms)')

# Plot Open Time
ax[1, 0].plot(num_bidders, open_times, marker='o', color='red')
ax[1, 0].set_title('Open Time')
ax[1, 0].set_xlabel('Number of Bidders')
ax[1, 0].set_ylabel('Time (ms)')

# Plot Verify Time
ax[1, 1].plot(num_bidders, verify_times, marker='o', color='purple')
ax[1, 1].set_title('Verify Time')
ax[1, 1].set_xlabel('Number of Bidders')
ax[1, 1].set_ylabel('Time (ms)')

# Plot Finish Time
ax[2, 0].plot(num_bidders, finish_times, marker='o', color='orange')
ax[2, 0].set_title('Finish Time')
ax[2, 0].set_xlabel('Number of Bidders')
ax[2, 0].set_ylabel('Time (ms)')

# Plot Total Time
ax[2, 1].plot(num_bidders, total_times, marker='o', color='black')
ax[2, 1].set_title('Total Time')
ax[2, 1].set_xlabel('Number of Bidders')
ax[2, 1].set_ylabel('Time (ms)')

# Adjust layout and show plot
plt.tight_layout()
plt.show()
