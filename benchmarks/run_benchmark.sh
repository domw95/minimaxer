# rebuild
npm run buildBenchmarks
# Set cpu for benchmark
# Disable turboboost
echo 1 | sudo tee /sys/devices/system/cpu/intel_pstate/no_turbo > /dev/null

# Enable performance mode
for i in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
do
    echo performance | sudo tee $i > /dev/null
    # cat $i
done

# Disable core 1 (hyperthreading)
echo 0 | sudo tee /sys/devices/system/cpu/cpu1/online > /dev/null


# Run node on cpu 0
sudo perf stat -- taskset -c 0 node "$1"

# Revert changes
# Enable turboboost
echo 0 | sudo tee /sys/devices/system/cpu/intel_pstate/no_turbo > /dev/null

# Renable core
echo 1 | sudo tee /sys/devices/system/cpu/cpu1/online > /dev/null

# Enable powersave mode
for i in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
do
  echo powersave | sudo tee $i > /dev/null
done

