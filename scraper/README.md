# Scraper
Tool to pull data from Sleeper and Fantasy Pros to get player data for the fantasy league. The output of this is a
JSON file which is included in the [website](../website).

Specific instructions for what is needed for running will be given by running the scraper with no command line args.

The output of the scrapper is written to standard out. In order to work with the website the output should be saved to
a file.

## Build

```bash
./mvnw package
```

## Run
```bash
java -jar target/jscraper*-shaded.jar
```
