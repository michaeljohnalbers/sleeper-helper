# Scraper
Tool to pull data from Sleeper and Fantasy Pros to get player data for the fantasy league. The output of this is a
JSON file that is included in the [website](../website).

Specific instructions for what is needed for running will be given by running the scraper with no command line args.

The output of the scrapper is written to standard out. In order to work with the website the output should be saved to
a file.

## Build

```bash
./mvnw package
```

## Run
```bash
java -jar target/scraper*-shaded.jar
```
This will output a few different files. See the website's README for what to do with them.


## Updating Everything
```bash
mvn wrapper:wrapper                         # Update the maven wrapper (use desired version of mvn, first - see SDKMAN)
./mvnw versions:display-dependency-updates  # Check what dependencies need updating
./mvnw versions:use-latest-dependencies     # Update the dependencies
./mvnw versions:display-plugin-updates      # Check what plugins need updating 
# Updating plugins needs to happen manually
```
