# Patreon Tiers - QuizNight.live

## Overview

Three subscription tiers for supporters of QuizNight.live, offering progressively more features and customization options.

---

## Tier 1: Supporter ($5/month)

### Benefits

- **Patron Badge** - Exclusive profile badge showing supporter status
- **Ad-Free Experience** - No advertisements during gameplay
- **Custom Name Color** - Choose from a selection of premium name colors
- **Early Access** - First look at new features before public release
- **Patron Discord Role** - Access to supporter-only Discord channels

---

## Tier 2: Champion ($10/month)

### Everything in Tier 1, plus:

- **Custom Avatar Frame** - Decorative border around your profile picture
- **Exclusive Chat Emojis** - Special emoji reactions only patrons can use
- **Priority Queue** - Join games even when they're nearly full
- **Patron Categories** - Access to exclusive quiz categories
- **Monthly Stats Email** - Personalized performance report each month
- **Double Daily Streak** - Daily streak counts as 2 days (for badge progress)

---

## Tier 3: Quiz Master ($20/month)

### Everything in Tier 2, plus:

- **Private Rooms** - Create invite-only games for friends
- **Custom Quizzes** - Upload and host your own question sets
- **2x Skill Points** - Earn double skill points from all badges
- **Patron Leaderboard** - Compete on an exclusive supporter-only leaderboard
- **Feature Voting** - Vote on upcoming features and priorities
- **Name in Credits** - Recognition on the About page

---

## Implementation Notes

### Database Changes

- Add `patronTier` field to user profile (0 = none, 1/2/3 = tier)
- Add `patronSince` timestamp
- Add `patronBadgeColor` for custom name color selection

### Badge Integration

- Create new `patron` badge group in awards system
- Patron badges should have a unique rarity (e.g., "patron" or use existing "legendary")
- Skill point multiplier applied at badge award time for Tier 3

### Feature Flags

| Feature | Tier 1 | Tier 2 | Tier 3 |
|---------|--------|--------|--------|
| Ad-free | Yes | Yes | Yes |
| Custom name color | Yes | Yes | Yes |
| Avatar frame | No | Yes | Yes |
| Exclusive emojis | No | Yes | Yes |
| Priority queue | No | Yes | Yes |
| Patron categories | No | Yes | Yes |
| Private rooms | No | No | Yes |
| Custom quizzes | No | No | Yes |
| 2x skill points | No | No | Yes |
| Patron leaderboard | No | No | Yes |

### Patreon Integration

- Use Patreon OAuth for linking accounts
- Webhook for tier changes (upgrade/downgrade/cancel)
- Daily sync job to verify active patrons
