/* ---------- AI assistant: fully local, offline, no API / no key / no server ----------
   No network request exists anywhere in this file. This is a large local knowledge
   base (100+ entries covering market basics, trading mechanics, fundamental and
   technical analysis, risk/portfolio management, macro, bonds, and derivatives) plus
   an intent-matching engine that scores every entry against the visitor's question,
   handles compound questions by combining the top matching entries, recognizes when
   someone is asking about a specific real company/ticker (and honestly says it has
   no live market data instead of inventing numbers), and can analyze numbers the
   visitor pastes in themselves. It is NOT a large language model — it cannot truly
   understand arbitrary novel phrasing the way Claude would — but the keyword/synonym
   coverage below is built to recognize the large majority of realistic phrasings a
   beginner-to-intermediate visitor would use. */

const KB = [
