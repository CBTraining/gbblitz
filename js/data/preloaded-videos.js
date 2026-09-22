/**
 * GBblitz - Preloaded Usable Videos Dataset
 * Compact representation expanding to full video objects on load (saving >80% bandwidth).
 * Contains all validated Wave 1-5 videos for instant offline / cold-start render.
 */

import { isUsableDesignation } from '../services/sheet-service.js?v=5.52.0';

function createVideo([fileId, title, designation, wave]) {
  return {
    id: 'drive-' + fileId,
    driveFileId: fileId,
    title: title,
    designation: designation,
    type: designation,
    wave: wave,
    category: wave,
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '=s800',
    videoUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=' + fileId,
    driveUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
    description: wave + (designation && !designation.toLowerCase().includes('approved') ? ' • ' + designation : '')
  };
}

const RAW_VIDEOS = [
  [
    "1IWtqhCz74IuOs7-gVLb0LQMB84sNfrQY",
    "Pretty darn excited for Googlebook!",
    "Approved",
    "Wave 1"
  ],
  [
    "1axmOmJ24OaqHojbD1Xg8edtikeyFfz-4",
    "Sams reaction to Googlebook",
    "Approved",
    "Wave 1"
  ],
  [
    "1ZBsuBDs3ty1C6CL2aidBxaTJuWODELDb",
    "First thoughts",
    "Approved",
    "Wave 1"
  ],
  [
    "1f2y45YARkgCFeH-MNv7eDvdduEYlr188",
    "Stan Klip Personal Sentiment",
    "Approved",
    "Wave 1"
  ],
  [
    "10orpHS-vuqal8moH-Epjs89DswBaeFK_",
    "Yovan's favorite google book",
    "Approved",
    "Wave 1"
  ],
  [
    "1EMqP1UhiqWkFSN5mK9DyBnmk9P8fwd-t",
    "Google book preview and Q and A (Riverhead)",
    "Approved",
    "Wave 1"
  ],
  [
    "1dIafHbNqkNs5f9qbCBlqx3bIKTqKLIlH",
    "Cole reacts to the new Googlebook",
    "Approved",
    "Wave 1"
  ],
  [
    "1CbJcj8t5WK9eaOinwE28hhcqs56MkXwS",
    "Microsoft RSA @ east colonial",
    "Approved",
    "Wave 1"
  ],
  [
    "1WmkxqzC7HUXHV6GBOWGAzXXau9iy78io",
    "Yaniel loves googlebook",
    "Approved",
    "Wave 1"
  ],
  [
    "1dKI1nsIEpujh_4-_Pezs0zgAUZTTRZwh",
    "2 Features liked about Google book",
    "Approved",
    "Wave 1"
  ],
  [
    "1rQ7PewZ-TkFKnjJAKcKDZyhCRIfMC0Jo",
    "Hundley Opinion",
    "Approved",
    "Wave 1"
  ],
  [
    "1QMiHuj73R9TkkjZfhyH296E0UkScVpZl",
    "Brandon from mobile reacting to Googlebooks",
    "Approved",
    "Wave 1"
  ],
  [
    "1b_yC9kHiaTQJPSW0BduidDZ_RqGbomhy",
    "Excitement",
    "Approved",
    "Wave 1"
  ],
  [
    "1g-6D99wM0F9R9k_-hJlpU5h1wlkYyzoR",
    "Chris favorite feature of Googlebooks",
    "Approved",
    "Wave 1"
  ],
  [
    "1CFDhDQFXLAjLZYDr9A7E8IIz-RJdNcc9",
    "Unboxing/Reaction",
    "Approved",
    "Wave 1"
  ],
  [
    "1hOPUu60Aoim993eCGTEMc_h_kN1WVOlS",
    "Store 1466 Hype Video",
    "Approved",
    "Wave 1"
  ],
  [
    "1bkL3JwUGOD-5ITGGx-lY8xPCF2UOQbUx",
    "Introduction",
    "Approved",
    "Wave 1"
  ],
  [
    "1hv3Oxlx871ge8WlCZ6whRsmXdUVYH93w",
    "Mooresville, NC Googlebook reveal",
    "Approved",
    "Wave 1"
  ],
  [
    "1dxh1c-BrUzFoaJEEWyz_SUUigHXXKEZi",
    "Manager Hype",
    "Approved",
    "Wave 1"
  ],
  [
    "1guLLWjbJT80k9pW0n9hVurXcUkJpiDnu",
    "Sentiment vid",
    "Approved",
    "Wave 1"
  ],
  [
    "1Q12Jap9HsG6QpHh9xaAlB46AnecPO3Hh",
    "Best buy 840 Josey - Sentiment",
    "Approved",
    "Wave 1"
  ],
  [
    "1vACamfWbw_9ZDMWFYbGj6eAEk306HtR2",
    "Reaction to Googlebook for the first time in St. Peters!",
    "Approved",
    "Wave 1"
  ],
  [
    "1QPJrrRxsjV--lyeZf0S1gfOZrC89wRza",
    "BBY 791 Googlebook Reaction",
    "Approved",
    "Wave 1"
  ],
  [
    "17CxQuRsj2JWHCRdvjiH4g12Uf1u6DYd_",
    "Angie's awesome reaction",
    "Highlight",
    "Wave 1"
  ],
  [
    "1tSdjdYXkFFOYSeKqywOOOwSYDIVTgO6i",
    "Countryside Reactions",
    "Approved",
    "Wave 1"
  ],
  [
    "1TyqCpRGfMYD5BzTQmnAUuCDe1vBm8IX-",
    "Microsoft VPL excitement",
    "Approved",
    "Wave 1"
  ],
  [
    "1GQUYNOhYJ5J1hUjdWu9xf-CZ2Raf3UqW",
    "BBY 791 Googlebook Reaction 2",
    "Approved",
    "Wave 1"
  ],
  [
    "12a8Sa4NuCrGbXl6oF9mzAbDV-PW9eGiV",
    "Sentiment vid",
    "Approved",
    "Wave 1"
  ],
  [
    "1pPgkJ5xFndeRBmFigU3o2TiViaX48VDJ",
    "What were excited about with Googlebook",
    "Approved",
    "Wave 1"
  ],
  [
    "1v9U_6V3-15KUab1Kj1fSLoAVXTshpuYN",
    "Honest reactions!",
    "Approved",
    "Wave 1"
  ],
  [
    "1YyJQohK9VHbgDJrzBLhrheNVZ_8Ve3Pv",
    "Store #160 RSA hype check",
    "Approved",
    "Wave 1"
  ],
  [
    "1VHEKzM5skIM2bLAv-OITNrJ4RyZTEKi2",
    "More flint excitement lenovo",
    "Approved",
    "Wave 1"
  ],
  [
    "1s5dZDjTh55rAGlMrT09Jf_OW_6U8jIYj",
    "What im excited about with Googlebook",
    "Approved",
    "Wave 1"
  ],
  [
    "14ZPPVlj5iEEYnjxIAhsTCbKRp1Pf5MLL",
    "Jeremy's favorite googlebook",
    "Approved",
    "Wave 1"
  ],
  [
    "1KHaiFtg-g7FyUwO0ueiW_XWd255X_Q-t",
    "Rsa favorite features of Googlebooks",
    "Approved",
    "Wave 1"
  ],
  [
    "1jcSROwwSQEUErr5QBRNUQmlZhBEc0ZzT",
    "Post Game Interview",
    "Approved",
    "Wave 1"
  ],
  [
    "1xMleK2iEXiAE7Tky6bqhraVwL7n03kKt",
    "Googlebook Sentiment - #463 Bangor, ME",
    "Approved",
    "Wave 1"
  ],
  [
    "1yWdPaHogTAz_r1vTFA4MFHT2NDz8ATcs",
    "Seamless integration",
    "Approved",
    "Wave 1"
  ],
  [
    "1ujMmYI-t-zoHNCgsGfpRDLVkhPOtf3nF",
    "Google book with Dave at Best Buy #386",
    "Approved",
    "Wave 1"
  ],
  [
    "1O8gG0IGup1nrsrY_EYol8YAHIfLN4G58",
    "Goooglebook top hits - #1790",
    "Approved",
    "Wave 1"
  ],
  [
    "1gIUt0ZJvbherqkbEJ3dKcp2iZ6_7EamY",
    "computer department impressions",
    "Approved",
    "Wave 1"
  ],
  [
    "1cSrpi0FjeTo_AuoKcNcDPw7hlIbDiXYv",
    "Premier unboxing",
    "Approved",
    "Wave 1"
  ],
  [
    "1stffly46VVrP7jjoxExZ1Z14_zqdoTec",
    "Sentiment from Shannon",
    "Approved",
    "Wave 1"
  ],
  [
    "1AhJnOp2QHAJ3HTG7xWc_ub-9aZdCou-K",
    "Sentiment from Alex",
    "Approved",
    "Wave 1"
  ],
  [
    "1TWtTi3h-rWIDOhDznGdmRPk9sh-Aq7px",
    "Gemini",
    "Approved",
    "Wave 1"
  ],
  [
    "11rv2vG1uddporQ128ud_OXIMx8MikLOZ",
    "Googlebook sentiment.",
    "Approved",
    "Wave 1"
  ],
  [
    "1ZT6ewBANqJli7CXThTlw98_fPWYfXEqx",
    "Lexington Park Reaction",
    "Approved",
    "Wave 1"
  ],
  [
    "14u6iXv79s5uzfoAjtL_9ADXkJIPB6NXo",
    "Googlebook preview They’re favorite features part 1 (stony brook)",
    "Approved",
    "Wave 1"
  ],
  [
    "1VcsngHx_oqUz6JJJfrGwfmcSYqWPr65V",
    "Excited for that Glowbar and more!",
    "Approved",
    "Wave 1"
  ],
  [
    "1fsEgyQ3LO0RTv_dj1i1j0i8TmAi4QH_3",
    "RSA's opinions on GoogleBook",
    "Approved",
    "Wave 1"
  ],
  [
    "13xxkS2mkzH7qslHyURtGNrlbxp34f-HT",
    "Isaiah's first introduction to Googlebook",
    "Approved",
    "Wave 1"
  ],
  [
    "1W0AUzfl2VCAmCMHKu_fiqTMlwbhAsMsC",
    "Magic wow",
    "Approved",
    "Wave 1"
  ],
  [
    "1h0tYGGKDNLYfLjJY8z4ReVjKWmWKMdZ-",
    "Blue-shirt excitement",
    "Approved",
    "Wave 1"
  ],
  [
    "1dD8XtwtxBT_7Loubv3JzeOV0a553h9nN",
    "Xander Wilson's thoughts on Googlebook",
    "Approved",
    "Wave 1"
  ],
  [
    "1GEmAuxUx07b1jFDmnl3Roc6QMj3ZOCU2",
    "Butterfield Googlebook Reveal",
    "Approved",
    "Wave 1"
  ],
  [
    "1WeOXsuP4RL0edUiCLKr5_KS6Sl1X5RzK",
    "Thoughts",
    "Approved",
    "Wave 1"
  ],
  [
    "1b8-EH9Jl-tVE7ECuD1XrHmHAMhU0KyNw",
    "Googlebook Hype!",
    "Approved",
    "Wave 1"
  ],
  [
    "1fOYfnPNyF4JIWZE1bLehW2pL90iVnSvG",
    "Computing with interest",
    "Approved",
    "Wave 1"
  ],
  [
    "1l_tUSXgMig40X9xhLIRo4mo_tDG4n_kd",
    "Computing excitement",
    "Approved",
    "Wave 1"
  ],
  [
    "1BhS66HijQvQdlVz4xnfiTMr-CsdHzfYj",
    "Fullerton Googlebook sentiment 1",
    "Approved",
    "Wave 1"
  ],
  [
    "1mekCcF0hoca_5DbX1J2cRQhkAPHflKe_",
    "Reaction",
    "Approved",
    "Wave 1"
  ],
  [
    "1i3mJJbWPZ2Q5qaiCVkZpmv_-h9us0mP3",
    "Googleback Hype Train Ben from store #274",
    "Approved",
    "Wave 1"
  ],
  [
    "1aDuiT4UsvDKGiMpj_RJFhk6wAEskch9j",
    "Fullerton Googlebook sentiment 2",
    "Approved",
    "Wave 1"
  ],
  [
    "1EYHHf1cAZhW_FiUKSHfBRiydPsAUYe47",
    "RSAs positive feedback on Googlebook",
    "Highlight",
    "Wave 1"
  ],
  [
    "1_JvS4Dq6_8OKcKXiwby2eAmZChvGRgjP",
    "Box opening reaction",
    "Approved",
    "Wave 1"
  ],
  [
    "1oW1ofqsf8iDPMJw1ymfpPFjPXezO5rch",
    "Googlebook Bayshore Party!",
    "Approved",
    "Wave 1"
  ],
  [
    "1vlJjG6IOJyiIJlZ-dbX-Ccn0WaRraxy3",
    "RSAs Excited about GoogleBook!",
    "Approved",
    "Wave 1"
  ],
  [
    "1WqHXvJp4jVIaTn_kjEMayvn0EZJNDX0m",
    "Mobile RSA - FL Mall",
    "Approved",
    "Wave 1"
  ],
  [
    "1Ay5_ur6c6j9EwntO6J1GQkeqR8qYHY32",
    "Manahawkin RSAs Excited about GoogleBook!",
    "Approved",
    "Wave 1"
  ],
  [
    "16LQLZaqCsLGIIIz9Al-ls5tpsUYRyknq",
    "Jeanette from BBY425 - Jeremy Rising",
    "Approved",
    "Wave 1"
  ],
  [
    "1ltlrTsF-EZfecL8xUgMyWn6s4jsv-QAI",
    "Googlebook introduction",
    "Approved",
    "Wave 1"
  ],
  [
    "13fi6Cgq5gHUFrJ0db6_8qGxRw3XQ0eBU",
    "Sentiment of Googlebook Software",
    "Approved",
    "Wave 1"
  ],
  [
    "1smxEio9XcvpHggHCyYMTvDhRW1Zp-dmk",
    "Kevin - Best Buy #1018",
    "Highlight",
    "Wave 1"
  ],
  [
    "1WsHpGnXgBsQRx-INNrdDD1ZQCG9YfJCK",
    "Folsom 845 - 1",
    "Approved",
    "Wave 1"
  ],
  [
    "1XNgrsbarkHfeULD7fjOLKB0ZqO4RA4k4",
    "Folsom 845 - 2",
    "Approved",
    "Wave 1"
  ],
  [
    "13tEt40CwW6gQKYTbIHCqoHojbXFgQ6o1",
    "Spec Excitement!",
    "Approved",
    "Wave 1"
  ],
  [
    "1iXTPN7IQ11XE3HO-RXXTtQrq-B893nQp",
    "DJ Crumbley",
    "Approved",
    "Wave 1"
  ],
  [
    "13YW6hdEaEwJQt8gANA9NS1Q1ivOaUGKm",
    "Top 3 Features about GoogleBook",
    "Approved",
    "Wave 1"
  ],
  [
    "1TLdTHISq_NL2oA7tRYqEYFbFL55f44qr",
    "South Bay",
    "Approved",
    "Wave 1"
  ],
  [
    "1UGeYXUQ3chTkUl3xBkshW1hmy5rafdQ8",
    "Googlebook preview in bestbuy 345 part 1. (Huntington)",
    "Approved",
    "Wave 1"
  ],
  [
    "1xS3mFo3NuzHMB8OVkzI3WsrXtsWrkkst",
    "Googlebook Sentiment - #1464 Augusta, ME",
    "Approved",
    "Wave 1"
  ],
  [
    "1fBd0xbivMgMAR7nRPxticb_IJBw56122",
    "Levittown Googlebook Celebration",
    "Approved",
    "Wave 1"
  ],
  [
    "1KmC91ONAoptT3kIw0o9budw4nqFt_0yQ",
    "Annapolis Reaction",
    "Approved",
    "Wave 1"
  ],
  [
    "100N5ISuI3ZsjmDnnpDVWSjJXoMyWTE6t",
    "Googlebook love.",
    "Approved",
    "Wave 1"
  ],
  [
    "1aZWdlsh9es4Ap58mQAcFZMBfF95RT-dZ",
    "Googlebook hype",
    "Approved",
    "Wave 1"
  ],
  [
    "1FdcGN-RLkcx6aJoUVuZDy8wI_MpcI8kv",
    "Googlebook interest",
    "Approved",
    "Wave 1"
  ],
  [
    "1ecw2NYwDxOoOTwMD1exGcYokqyzJYzws",
    "Loving the hype",
    "Approved",
    "Wave 1"
  ],
  [
    "1xxr2qbrkSgmTxTgU3qtt4sHwE8m435qd",
    "I'm excited",
    "Approved",
    "Wave 1"
  ],
  [
    "1mDDGhJuDarKqivniY1xa437El1hrpOO1",
    "Baldwin Googlebook Bonanza",
    "Approved",
    "Wave 1"
  ],
  [
    "16Lah5RNzJdbrvaBSrgATaEhYVaFDbiW4",
    "Google book preview part 1 Best Buy 950",
    "Approved",
    "Wave 1"
  ],
  [
    "1DlwHQfTYieD8K30D-dyZePoE3hEbeVfD",
    "Excitement in Deptford NJ!",
    "Approved",
    "Wave 1"
  ]
];

export const PRELOADED_VIDEOS = RAW_VIDEOS.map(createVideo);
