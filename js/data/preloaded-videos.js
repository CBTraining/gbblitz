/**
 * GBblitz - Preloaded Usable Videos Dataset
 * Compact representation expanding to full video objects on load (saving >80% bandwidth).
 * Contains all validated Wave 1-5 videos for instant offline / cold-start render.
 */

import { isUsableDesignation } from '../services/sheet-service.js?v=5.59.0';

function createVideo([fileId, title, designation, category]) {
  const cat = (!category || category === 'Wave 1') ? 'Sentiment' : category;
  return {
    id: 'drive-' + fileId,
    driveFileId: fileId,
    title: title,
    designation: designation,
    type: designation,
    wave: cat,
    category: cat,
    duration: 'HD',
    thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '=s800',
    videoUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
    streamUrl: 'https://drive.google.com/uc?export=download&id=' + fileId,
    driveUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
    description: cat + (designation && !designation.toLowerCase().includes('approved') ? ' • ' + designation : '')
  };
}

const RAW_VIDEOS = [
  [
    "1IWtqhCz74IuOs7-gVLb0LQMB84sNfrQY",
    "Pretty darn excited for Googlebook!",
    "Approved",
    "Sentiment"
  ],
  [
    "1axmOmJ24OaqHojbD1Xg8edtikeyFfz-4",
    "Sams reaction to Googlebook",
    "Approved",
    "Sentiment"
  ],
  [
    "1ZBsuBDs3ty1C6CL2aidBxaTJuWODELDb",
    "First thoughts",
    "Approved",
    "Sentiment"
  ],
  [
    "1f2y45YARkgCFeH-MNv7eDvdduEYlr188",
    "Stan Klip Personal Sentiment",
    "Approved",
    "Sentiment"
  ],
  [
    "10orpHS-vuqal8moH-Epjs89DswBaeFK_",
    "Yovan's favorite google book",
    "Approved",
    "Sentiment"
  ],
  [
    "1EMqP1UhiqWkFSN5mK9DyBnmk9P8fwd-t",
    "Google book preview and Q and A (Riverhead)",
    "Approved",
    "Sentiment"
  ],
  [
    "1dIafHbNqkNs5f9qbCBlqx3bIKTqKLIlH",
    "Cole reacts to the new Googlebook",
    "Approved",
    "Sentiment"
  ],
  [
    "1CbJcj8t5WK9eaOinwE28hhcqs56MkXwS",
    "Microsoft RSA @ east colonial",
    "Approved",
    "Sentiment"
  ],
  [
    "1WmkxqzC7HUXHV6GBOWGAzXXau9iy78io",
    "Yaniel loves googlebook",
    "Approved",
    "Sentiment"
  ],
  [
    "1dKI1nsIEpujh_4-_Pezs0zgAUZTTRZwh",
    "2 Features liked about Google book",
    "Approved",
    "Sentiment"
  ],
  [
    "1rQ7PewZ-TkFKnjJAKcKDZyhCRIfMC0Jo",
    "Hundley Opinion",
    "Approved",
    "Sentiment"
  ],
  [
    "1QMiHuj73R9TkkjZfhyH296E0UkScVpZl",
    "Brandon from mobile reacting to Googlebooks",
    "Approved",
    "Sentiment"
  ],
  [
    "1b_yC9kHiaTQJPSW0BduidDZ_RqGbomhy",
    "Excitement",
    "Approved",
    "Sentiment"
  ],
  [
    "1g-6D99wM0F9R9k_-hJlpU5h1wlkYyzoR",
    "Chris favorite feature of Googlebooks",
    "Approved",
    "Sentiment"
  ],
  [
    "1CFDhDQFXLAjLZYDr9A7E8IIz-RJdNcc9",
    "Unboxing/Reaction",
    "Approved",
    "Sentiment"
  ],
  [
    "1hOPUu60Aoim993eCGTEMc_h_kN1WVOlS",
    "Store 1466 Hype Video",
    "Approved",
    "Sentiment"
  ],
  [
    "1bkL3JwUGOD-5ITGGx-lY8xPCF2UOQbUx",
    "Introduction",
    "Approved",
    "Sentiment"
  ],
  [
    "1hv3Oxlx871ge8WlCZ6whRsmXdUVYH93w",
    "Mooresville, NC Googlebook reveal",
    "Approved",
    "Sentiment"
  ],
  [
    "1dxh1c-BrUzFoaJEEWyz_SUUigHXXKEZi",
    "Manager Hype",
    "Approved",
    "Sentiment"
  ],
  [
    "1guLLWjbJT80k9pW0n9hVurXcUkJpiDnu",
    "Sentiment vid",
    "Approved",
    "Sentiment"
  ],
  [
    "1Q12Jap9HsG6QpHh9xaAlB46AnecPO3Hh",
    "Best buy 840 Josey - Sentiment",
    "Approved",
    "Sentiment"
  ],
  [
    "1vACamfWbw_9ZDMWFYbGj6eAEk306HtR2",
    "Reaction to Googlebook for the first time in St. Peters!",
    "Approved",
    "Sentiment"
  ],
  [
    "1QPJrrRxsjV--lyeZf0S1gfOZrC89wRza",
    "BBY 791 Googlebook Reaction",
    "Approved",
    "Sentiment"
  ],
  [
    "17CxQuRsj2JWHCRdvjiH4g12Uf1u6DYd_",
    "Angie's awesome reaction",
    "Highlight",
    "Sentiment"
  ],
  [
    "1tSdjdYXkFFOYSeKqywOOOwSYDIVTgO6i",
    "Countryside Reactions",
    "Approved",
    "Sentiment"
  ],
  [
    "1TyqCpRGfMYD5BzTQmnAUuCDe1vBm8IX-",
    "Microsoft VPL excitement",
    "Approved",
    "Sentiment"
  ],
  [
    "1GQUYNOhYJ5J1hUjdWu9xf-CZ2Raf3UqW",
    "BBY 791 Googlebook Reaction 2",
    "Approved",
    "Sentiment"
  ],
  [
    "12a8Sa4NuCrGbXl6oF9mzAbDV-PW9eGiV",
    "Sentiment vid",
    "Approved",
    "Sentiment"
  ],
  [
    "1pPgkJ5xFndeRBmFigU3o2TiViaX48VDJ",
    "What were excited about with Googlebook",
    "Approved",
    "Sentiment"
  ],
  [
    "1v9U_6V3-15KUab1Kj1fSLoAVXTshpuYN",
    "Honest reactions!",
    "Approved",
    "Sentiment"
  ],
  [
    "1YyJQohK9VHbgDJrzBLhrheNVZ_8Ve3Pv",
    "Store #160 RSA hype check",
    "Approved",
    "Sentiment"
  ],
  [
    "1VHEKzM5skIM2bLAv-OITNrJ4RyZTEKi2",
    "More flint excitement lenovo",
    "Approved",
    "Sentiment"
  ],
  [
    "1s5dZDjTh55rAGlMrT09Jf_OW_6U8jIYj",
    "What im excited about with Googlebook",
    "Approved",
    "Sentiment"
  ],
  [
    "14ZPPVlj5iEEYnjxIAhsTCbKRp1Pf5MLL",
    "Jeremy's favorite googlebook",
    "Approved",
    "Sentiment"
  ],
  [
    "1KHaiFtg-g7FyUwO0ueiW_XWd255X_Q-t",
    "Rsa favorite features of Googlebooks",
    "Approved",
    "Sentiment"
  ],
  [
    "1jcSROwwSQEUErr5QBRNUQmlZhBEc0ZzT",
    "Post Game Interview",
    "Approved",
    "Sentiment"
  ],
  [
    "1xMleK2iEXiAE7Tky6bqhraVwL7n03kKt",
    "Googlebook Sentiment - #463 Bangor, ME",
    "Approved",
    "Sentiment"
  ],
  [
    "1yWdPaHogTAz_r1vTFA4MFHT2NDz8ATcs",
    "Seamless integration",
    "Approved",
    "Sentiment"
  ],
  [
    "1ujMmYI-t-zoHNCgsGfpRDLVkhPOtf3nF",
    "Google book with Dave at Best Buy #386",
    "Approved",
    "Sentiment"
  ],
  [
    "1O8gG0IGup1nrsrY_EYol8YAHIfLN4G58",
    "Goooglebook top hits - #1790",
    "Approved",
    "Sentiment"
  ],
  [
    "1gIUt0ZJvbherqkbEJ3dKcp2iZ6_7EamY",
    "computer department impressions",
    "Approved",
    "Sentiment"
  ],
  [
    "1cSrpi0FjeTo_AuoKcNcDPw7hlIbDiXYv",
    "Premier unboxing",
    "Approved",
    "Sentiment"
  ],
  [
    "1stffly46VVrP7jjoxExZ1Z14_zqdoTec",
    "Sentiment from Shannon",
    "Approved",
    "Sentiment"
  ],
  [
    "1AhJnOp2QHAJ3HTG7xWc_ub-9aZdCou-K",
    "Sentiment from Alex",
    "Approved",
    "Sentiment"
  ],
  [
    "1TWtTi3h-rWIDOhDznGdmRPk9sh-Aq7px",
    "Gemini",
    "Approved",
    "Sentiment"
  ],
  [
    "11rv2vG1uddporQ128ud_OXIMx8MikLOZ",
    "Googlebook sentiment.",
    "Approved",
    "Sentiment"
  ],
  [
    "1ZT6ewBANqJli7CXThTlw98_fPWYfXEqx",
    "Lexington Park Reaction",
    "Approved",
    "Sentiment"
  ],
  [
    "14u6iXv79s5uzfoAjtL_9ADXkJIPB6NXo",
    "Googlebook preview They’re favorite features part 1 (stony brook)",
    "Approved",
    "Sentiment"
  ],
  [
    "1VcsngHx_oqUz6JJJfrGwfmcSYqWPr65V",
    "Excited for that Glowbar and more!",
    "Approved",
    "Sentiment"
  ],
  [
    "1fsEgyQ3LO0RTv_dj1i1j0i8TmAi4QH_3",
    "RSA's opinions on GoogleBook",
    "Approved",
    "Sentiment"
  ],
  [
    "13xxkS2mkzH7qslHyURtGNrlbxp34f-HT",
    "Isaiah's first introduction to Googlebook",
    "Approved",
    "Sentiment"
  ],
  [
    "1W0AUzfl2VCAmCMHKu_fiqTMlwbhAsMsC",
    "Magic wow",
    "Approved",
    "Sentiment"
  ],
  [
    "1h0tYGGKDNLYfLjJY8z4ReVjKWmWKMdZ-",
    "Blue-shirt excitement",
    "Approved",
    "Sentiment"
  ],
  [
    "1dD8XtwtxBT_7Loubv3JzeOV0a553h9nN",
    "Xander Wilson's thoughts on Googlebook",
    "Approved",
    "Sentiment"
  ],
  [
    "1GEmAuxUx07b1jFDmnl3Roc6QMj3ZOCU2",
    "Butterfield Googlebook Reveal",
    "Approved",
    "Sentiment"
  ],
  [
    "1WeOXsuP4RL0edUiCLKr5_KS6Sl1X5RzK",
    "Thoughts",
    "Approved",
    "Sentiment"
  ],
  [
    "1b8-EH9Jl-tVE7ECuD1XrHmHAMhU0KyNw",
    "Googlebook Hype!",
    "Approved",
    "Sentiment"
  ],
  [
    "1fOYfnPNyF4JIWZE1bLehW2pL90iVnSvG",
    "Computing with interest",
    "Approved",
    "Sentiment"
  ],
  [
    "1l_tUSXgMig40X9xhLIRo4mo_tDG4n_kd",
    "Computing excitement",
    "Approved",
    "Sentiment"
  ],
  [
    "1BhS66HijQvQdlVz4xnfiTMr-CsdHzfYj",
    "Fullerton Googlebook sentiment 1",
    "Approved",
    "Sentiment"
  ],
  [
    "1mekCcF0hoca_5DbX1J2cRQhkAPHflKe_",
    "Reaction",
    "Approved",
    "Sentiment"
  ],
  [
    "1i3mJJbWPZ2Q5qaiCVkZpmv_-h9us0mP3",
    "Googleback Hype Train Ben from store #274",
    "Approved",
    "Sentiment"
  ],
  [
    "1aDuiT4UsvDKGiMpj_RJFhk6wAEskch9j",
    "Fullerton Googlebook sentiment 2",
    "Approved",
    "Sentiment"
  ],
  [
    "1EYHHf1cAZhW_FiUKSHfBRiydPsAUYe47",
    "RSAs positive feedback on Googlebook",
    "Highlight",
    "Sentiment"
  ],
  [
    "1_JvS4Dq6_8OKcKXiwby2eAmZChvGRgjP",
    "Box opening reaction",
    "Approved",
    "Sentiment"
  ],
  [
    "1oW1ofqsf8iDPMJw1ymfpPFjPXezO5rch",
    "Googlebook Bayshore Party!",
    "Approved",
    "Sentiment"
  ],
  [
    "1vlJjG6IOJyiIJlZ-dbX-Ccn0WaRraxy3",
    "RSAs Excited about GoogleBook!",
    "Approved",
    "Sentiment"
  ],
  [
    "1WqHXvJp4jVIaTn_kjEMayvn0EZJNDX0m",
    "Mobile RSA - FL Mall",
    "Approved",
    "Sentiment"
  ],
  [
    "1Ay5_ur6c6j9EwntO6J1GQkeqR8qYHY32",
    "Manahawkin RSAs Excited about GoogleBook!",
    "Approved",
    "Sentiment"
  ],
  [
    "16LQLZaqCsLGIIIz9Al-ls5tpsUYRyknq",
    "Jeanette from BBY425 - Jeremy Rising",
    "Approved",
    "Sentiment"
  ],
  [
    "1ltlrTsF-EZfecL8xUgMyWn6s4jsv-QAI",
    "Googlebook introduction",
    "Approved",
    "Sentiment"
  ],
  [
    "13fi6Cgq5gHUFrJ0db6_8qGxRw3XQ0eBU",
    "Sentiment of Googlebook Software",
    "Approved",
    "Sentiment"
  ],
  [
    "1smxEio9XcvpHggHCyYMTvDhRW1Zp-dmk",
    "Kevin - Best Buy #1018",
    "Highlight",
    "Sentiment"
  ],
  [
    "1WsHpGnXgBsQRx-INNrdDD1ZQCG9YfJCK",
    "Folsom 845 - 1",
    "Approved",
    "Sentiment"
  ],
  [
    "1XNgrsbarkHfeULD7fjOLKB0ZqO4RA4k4",
    "Folsom 845 - 2",
    "Approved",
    "Sentiment"
  ],
  [
    "13tEt40CwW6gQKYTbIHCqoHojbXFgQ6o1",
    "Spec Excitement!",
    "Approved",
    "Sentiment"
  ],
  [
    "1iXTPN7IQ11XE3HO-RXXTtQrq-B893nQp",
    "DJ Crumbley",
    "Approved",
    "Sentiment"
  ],
  [
    "13YW6hdEaEwJQt8gANA9NS1Q1ivOaUGKm",
    "Top 3 Features about GoogleBook",
    "Approved",
    "Sentiment"
  ],
  [
    "1TLdTHISq_NL2oA7tRYqEYFbFL55f44qr",
    "South Bay",
    "Approved",
    "Sentiment"
  ],
  [
    "1UGeYXUQ3chTkUl3xBkshW1hmy5rafdQ8",
    "Googlebook preview in bestbuy 345 part 1. (Huntington)",
    "Approved",
    "Sentiment"
  ],
  [
    "1xS3mFo3NuzHMB8OVkzI3WsrXtsWrkkst",
    "Googlebook Sentiment - #1464 Augusta, ME",
    "Approved",
    "Sentiment"
  ],
  [
    "1fBd0xbivMgMAR7nRPxticb_IJBw56122",
    "Levittown Googlebook Celebration",
    "Approved",
    "Sentiment"
  ],
  [
    "1KmC91ONAoptT3kIw0o9budw4nqFt_0yQ",
    "Annapolis Reaction",
    "Approved",
    "Sentiment"
  ],
  [
    "100N5ISuI3ZsjmDnnpDVWSjJXoMyWTE6t",
    "Googlebook love.",
    "Approved",
    "Sentiment"
  ],
  [
    "1aZWdlsh9es4Ap58mQAcFZMBfF95RT-dZ",
    "Googlebook hype",
    "Approved",
    "Sentiment"
  ],
  [
    "1FdcGN-RLkcx6aJoUVuZDy8wI_MpcI8kv",
    "Googlebook interest",
    "Approved",
    "Sentiment"
  ],
  [
    "1ecw2NYwDxOoOTwMD1exGcYokqyzJYzws",
    "Loving the hype",
    "Approved",
    "Sentiment"
  ],
  [
    "1xxr2qbrkSgmTxTgU3qtt4sHwE8m435qd",
    "I'm excited",
    "Approved",
    "Sentiment"
  ],
  [
    "1mDDGhJuDarKqivniY1xa437El1hrpOO1",
    "Baldwin Googlebook Bonanza",
    "Approved",
    "Sentiment"
  ],
  [
    "16Lah5RNzJdbrvaBSrgATaEhYVaFDbiW4",
    "Google book preview part 1 Best Buy 950",
    "Approved",
    "Sentiment"
  ],
  [
    "1DlwHQfTYieD8K30D-dyZePoE3hEbeVfD",
    "Excitement in Deptford NJ!",
    "Approved",
    "Sentiment"
  ]
];

export const PRELOADED_VIDEOS = RAW_VIDEOS.map(createVideo);
