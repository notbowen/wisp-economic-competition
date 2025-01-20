# Economic Competition WISP

Game to showcase economic competition for Ngee Ann's WISP module.

---

## Warnings

1. Ngee Ann's Wi-Fi might block the websocket connections - Use mobile data

---

## Overview

Each player mans a company, and each company resides within one of 2 countries
with different factors.

## Game Loop

Once started, the game enters a gameloop of 10 seconds each until 3 minutes is up.
In each loop, the player can tweak their properties freely. At the end of 10 seconds,
the changes are calculated and committed to each player.

The objective of this game is to maximise profit.

### Sabotage

A player can sabotage another player's company. The success rate depends on the
country. If successful, the sabotaged company will lose `sabotage cost`. If not,
the loss is beared by the saboteur.

## Country Properties

- Demand: Equally split amongst users, 1:1 mapping of units sold
- Marketing cost: 1 unit of marketing costs this much
- Production cost: 1 unit of product costs this much to make
- Sabotage cost: Sabotaging a company costs this much
- Sabotage chance: Success rate of sabotage
- Starting cash: Amount of cash to start with
- Total marketing: Total marketing of all players
- Maximum price: Maximum price to sell at

## Player Properties

- Cash: Amount of cash on hand
- Price: Price of product
- Expected profit: Amount to earn at the end of the round
- Marketing: Amount of marketing to do
- Sabotage: Which company to sabotage

Expected profit is calculated as:

```txt
Expected profit = (Player Demand * (Price - Product cost)) - (Marketing cost * Marketing)
```

Player demand is calculated as:

```txt
Player Demand = Country Demand * (Player Marketing / Total Country Marketing) * (1 - (Price / Maximum Price))
```

---

## Country Values

| **Property**       | **China**             | **USA**              |
|--------------------|-----------------------|----------------------|
| **Demand**         | 10,000 units          | 7,000 units          |
| **Marketing Cost** | $50 per point         | $55 per point        |
| **Product Cost**   | $8 per unit           | $10 per unit         |
| **Sabotage Cost**  | $20,000 per attempt   | $25,000 per attempt  |
| **Sabotage Rate**  | 70%                   | 80%                  |
| **Starting Cash**  | $30,000               | $35,000              |

---

## Disclaimer

This project was hacked together in a few days. It is not intended for
production use as it is possible for players to gain an unfair advantage
in the game by reading the source code.

## Setup

A `Dockerfile` is included in this application, so feel free to build
that and expose ports `3000` and `6969` to run the game. To setup for
development, run `bun install` and `bun run dev`.

To install `bun`, follow [their documentation](https://bun.sh/docs/installation).

## Remaining Tasks

- [x] Tweak sabotaging
- [x] Add "user authentication" on the admin page
- [x] Add a leaderboard on the admin page
- [x] Fine-tune the values
- [ ] Playtest with the rest of the team
