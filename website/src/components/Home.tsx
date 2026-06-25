import React from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { LEAGUE_NAME } from "../constants/global";

export default function Home() {
  return (
    <>
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome
          </Typography>

          <Typography variant="body1" sx={{ mb: 4 }}>
            Welcome to the {LEAGUE_NAME} helper. Select a tool in the hamburger
            menu to get started.
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
