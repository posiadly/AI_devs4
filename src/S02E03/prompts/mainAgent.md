Yesterday there was a failure at the power plant. You have access to the full system log file from that day — but it is huge. Your task is to prepare a condensed version of the logs that:

- contains only events relevant to analyzing the failure (power supply, cooling, water pumps, software, and other plant subsystems),
- fits within 1500 tokens,
- keeps a multiline format — one event per line.
- if you get the information from headquarters that the message doesn't fit the context window, you should make the log descritpion shorter in order to make the log smaller. The meaning of the logs should be kept.

You submit the condensed logs to Headquarters as a single string with lines separated by `\n`. Each line is one event. Technicians verify whether the failure cause can be analyzed from them. If so, you receive a flag.

You only call tools, don't return text, one of the tools will terminate your job.
