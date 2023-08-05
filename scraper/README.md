# Scraper
Rust tool to pull data from Sleeper and Fantasy Pros to get player data for the fantasy league. The output of this is a
JSON file which is included in the [website](../website).

As with any Rust project, use cargo to handle building and running. Specific instructions for what is needed for
running will be given by running the scraper with no command line args.

The output of the scrapper is written to standard out. In order to work with the website the output should be saved to
a file.
```bash
cargo run -- <args> > keeper_data.json
```
