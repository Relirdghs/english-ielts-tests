# Цель следующего этапа

Довести текущую платформу академического C1-C2 тестирования от сильной offline-beta версии до профессионального assessment-продукта, который можно безопасно использовать для диагностики, обучения, экспертной оценки и пилотной калибровки. Следующий этап должен закрыть главные незавершенные зоны: независимую экспертную проверку банка, реальную психометрику на пилотных прохождениях, защищенную teacher/candidate delivery-модель и полноценный production-контур. Платформа должна стать не просто HTML-тестом с хорошим банком вопросов, а управляемой системой с ролями, протоколами, аудитом качества, версионированием, отчетностью и понятным процессом выпуска новых партий заданий. Главный критерий успеха: каждый вопрос, результат, отчет, источник, версия банка и пользовательский сценарий должны быть проверяемыми, воспроизводимыми и пригодными для профессионального использования без ручного хаоса.

# Большой план дальнейшего улучшения проекта

## 1. Product Direction and Scope

1. Зафиксировать целевую модель продукта: diagnostic tool, full exam simulator, teacher assessment console, item-bank management tool and pilot psychometrics lab.
2. Разделить roadmap на четыре maturity levels: offline beta, controlled pilot, institutional beta, production release.
3. Описать, какие функции относятся к candidate experience, какие к evaluator experience, какие к admin/psychometrician experience.
4. Ввести release policy: что можно называть beta, pilot-ready, production-ready and psychometrically calibrated.
5. Зафиксировать non-goals: не обещать официальную сертификацию, если нет аккредитации, norming sample and external validation.
6. Подготовить product brief на одну страницу: audience, use cases, risks, evidence, limitations.
7. Добавить отдельный `ROADMAP.md` с этапами, owners, artifacts and gates.
8. Ввести decision log, чтобы фиксировать причины изменений в scoring, bank policy, source policy and delivery model.
9. Разделить documentation для разработчика, преподавателя, кандидата, reviewer and psychometrician.
10. Создать glossary: facility index, discrimination, confidence-adjusted score, retirement rule, source horizon, distractor plausibility.

## 2. Assessment Design and Construct Validity

11. Перепроверить construct map: какие именно академические компетенции измеряются на C1-high, C2-entry, C2-secure and PhD-screening levels.
12. Сопоставить каждый skill module с measurable behavior: inference, synthesis, methodological critique, data interpretation, academic register, argument structure.
13. Добавить blueprint matrix: category x skill x difficulty x source domain x cognitive trap.
14. Проверить balance банка: чтобы ни один skill, domain или trap не доминировал случайно.
15. Добавить construct coverage report, который автоматически показывает дыры и перекосы.
16. Для каждого задания добавить explicit construct rationale: почему вопрос измеряет именно заявленную компетенцию.
17. Проверить, что Category A, B and C не различаются только форматом, а реально измеряют разные cognitive operations.
18. Добавить секцию "assessment claims": какие выводы можно делать по результату, а какие нельзя.
19. Добавить секцию "score interpretation boundaries": где score reliable, а где нужен human review.
20. Подготовить reviewer rubric для construct alignment.

## 3. Expert Review Workflow

21. Провести независимую экспертную проверку всех 300 items.
22. Разделить review на два прохода: linguistic/editorial review and assessment/psychometric review.
23. Ввести reviewer IDs без личных данных в public output.
24. Добавить review status для каждого item: draft, machine-triaged, human-reviewed, approved, needs-revision, retired.
25. Для каждого спорного item сохранять adjudication note.
26. Добавить reviewer disagreement tracking: accepted, rejected, unresolved.
27. Подготовить clean review UI или spreadsheet template для экспертов.
28. Добавить round-based review: Review Round 1, Revision, Review Round 2, Final Approval.
29. Автоматически собирать список items, где reviewer flag совпадает с automated risk flag.
30. Запретить production release, если есть unadjudicated P1/P2 issues.
31. Добавить expert sign-off packet для каждой версии банка.
32. Сформировать final approved bank snapshot после экспертной проверки.

## 4. Item Bank Quality

33. Усилить uniqueness scoring: считать похожесть не только opening phrases, но и argument skeletons, option logic and rationale templates.
34. Добавить lexical diversity metrics для passages, prompts and options.
35. Проверить answer-key distribution по категориям, difficulty and source domain.
36. Добавить max repetition thresholds for wording, option shape, rationale style and distractor pattern.
37. Добавить semantic neighbor report: пары items, которые слишком похожи по смыслу.
38. Проверить option-length bias: correct option should not be reliably longer, more cautious or more technical.
39. Проверить modality bias: correct answers should not be identifiable by words like may, likely, nuanced, however.
40. Добавить distractor strength model: easy distractor, plausible distractor, expert-level distractor.
41. Ввести hard rule: каждый approved item должен иметь at least two credible distractors.
42. Добавить `item_revision_history` для отслеживания изменений формулировок.
43. Добавить bank diff report между версиями: added, edited, retired, reweighted.
44. Ввести stable item IDs that never get reused after retirement.
45. Подготовить next bank namespace: ACC_301-600, with no overlap in source horizons.

## 5. Source Policy and Evidence Discipline

46. Уточнить source horizon policy: источники задают academic context, но passages остаются original assessment prose.
47. Добавить source domain diversity target: linguistics, public health, education, economics, climate, AI, policy, sociology, methodology.
48. Проверить, что article-level URLs остаются live and relevant.
49. Добавить periodic source revalidation script.
50. Добавить source freshness window: current, still-relevant, historical-context-only.
51. Для каждого source horizon добавить citation confidence: verified, likely, needs manual check.
52. Добавить source replacement workflow для dead links.
53. Подготовить copyright/licensing note for candidate and evaluator reports.
54. Исключить любые claims that imply copied source passages.
55. Сформировать source audit appendix for institutional review.

## 6. Psychometric Calibration

56. Провести controlled pilot with real candidate responses.
57. Определить minimum sample size для первой калибровки and target sample для reliable item statistics.
58. Собирать response rows with item ID, selected answer, score, confidence, time, session mode and timestamp.
59. Проверить data quality: missing responses, duplicate attempts, impossible timings, random-click patterns.
60. Рассчитать facility index for every item.
61. Рассчитать discrimination index for every item.
62. Добавить point-biserial correlation where appropriate.
63. Добавить timing distribution per item: median, p75, p90, outliers.
64. Сравнить target difficulty with observed difficulty.
65. Пометить items for review: too easy, too hard, negative discrimination, too slow, too ambiguous.
66. Построить first calibration report: item-level and bank-level.
67. Добавить provisional cut-score model for C1 Secure, C2 Emerging and C2 Secure.
68. Провести standard setting workshop после пилота.
69. Проверить reliability metrics at section and full-test level.
70. Подготовить policy: when item is revised, psychometric stats reset or marked historical.
71. Подготовить second pilot after item revisions.
72. Только после этого менять readiness from awaiting-pilot-data to calibrated-beta.

## 7. Adaptive Testing

73. Разделить current adaptive mode and true calibrated adaptive mode.
74. До калибровки оставить adaptive mode as heuristic diagnostic, not true CAT.
75. После пилота ввести item parameters and ability estimate.
76. Добавить adaptive selection constraints: skill coverage, domain coverage, exposure control, difficulty progression.
77. Добавить stopping rules: fixed length, confidence threshold, precision threshold.
78. Исключить repeated item exposure within candidate history.
79. Добавить adaptive audit log: why each next item was selected.
80. Добавить fairness checks for adaptive routing.
81. Подготовить fallback mode if item pool for a skill is too thin.
82. Сравнить adaptive results with full-exam results на пилотных данных.

## 8. Scoring and Reporting

83. Довести scoring до protocol-grade: raw, weighted, partial-credit, confidence-adjusted and section-normalized scores.
84. Добавить per-item timing and per-section timing into final protocol.
85. Добавить answer history: selected answer, displayed order, correct answer, confidence, score, rationale visibility state.
86. Добавить candidate report without hidden key leakage before exam completion.
87. Добавить evaluator report with answer key, rationales, item metadata and review notes.
88. Добавить admin report with bank version, scoring version, session settings and integrity flags.
89. Добавить PDF export generated from a stable printable template.
90. Добавить report checksum/hash for result integrity.
91. Добавить report versioning, чтобы старые отчеты интерпретировались корректно после обновлений банка.
92. Добавить explanation text for CEFR bands and skill weaknesses.
93. Добавить remediation suggestions by skill, not generic advice.
94. Добавить comparison report between attempts.
95. Добавить CSV export suitable for psychometric analysis.
96. Добавить JSON schema for reports.

## 9. Candidate Experience

97. Сделать candidate mode completely clean: no answer keys, debug metadata, source verification internals or admin-only labels.
98. Добавить onboarding screen for exam rules without marketing-style landing page.
99. Добавить clear section navigation: current section, remaining questions, timing and completion state.
100. Улучшить mobile layout with sticky answer controls and compact passage mode.
101. Добавить distraction-free reading mode.
102. Добавить answer review screen before final submission.
103. Добавить confirmation when leaving a timed exam.
104. Добавить resume flow that clearly restores session state.
105. Добавить clear end-of-test state: submitted, locked, report available.
106. Добавить candidate-friendly explanation for partial credit.
107. Добавить optional confidence marking in diagnostic mode, required confidence marking in metacognitive mode.
108. Убрать cognitive overload from analytics while the candidate is still answering.
109. Добавить print-friendly candidate results.
110. Проверить all UI text for professional academic tone.

## 10. Evaluator and Teacher Experience

111. Добавить evaluator dashboard with candidate sessions, scores, skill breakdown and flagged items.
112. Добавить teacher comments per candidate and per section.
113. Добавить manual override field with audit trail.
114. Добавить rubric-aligned final recommendation.
115. Добавить cohort view: average scores, weak skills, hard items, timing anomalies.
116. Добавить export for LMS or spreadsheet import.
117. Добавить evaluator-only item inspect panel.
118. Добавить secure answer key visibility only after authentication in server mode.
119. Добавить moderation workflow for disputed results.
120. Добавить evaluator guide: how to interpret score bands and confidence analytics.

## 11. Admin and Bank Management

121. Перенести bank editing из runtime import/export в structured admin workflow.
122. Добавить item editor with validation.
123. Добавить draft preview mode.
124. Добавить automatic lint before save.
125. Добавить manual review assignment.
126. Добавить item status transitions with permissions.
127. Добавить bank release builder: choose approved items, generate version, lock snapshot.
128. Добавить bank archive and rollback.
129. Добавить import validation for external item banks.
130. Добавить schema migration tooling between bank versions.
131. Добавить item dependency checks for data displays and source metadata.
132. Добавить audit trail for all bank changes.

## 12. Security and Integrity

133. Перенести answer key protection в server-backed delivery model.
134. Разделить public candidate bundle and protected evaluator/admin APIs.
135. Добавить authentication for teacher/evaluator/admin roles.
136. Добавить session tokens without storing secrets in files or frontend.
137. Добавить server-side scoring option for high-stakes use.
138. Добавить tamper detection for client-side session data.
139. Добавить attempt locking after final submission.
140. Добавить proctoring-ready hooks without forcing surveillance by default.
141. Добавить IP/device/session metadata policy with privacy limits.
142. Добавить rate limits for hosted APIs.
143. Добавить secure file export pipeline.
144. Добавить no-secrets scan to every build.
145. Проверить that no personal emails or tokens leak into outputs.
146. Подготовить threat model for candidate cheating, key leakage and report tampering.

## 13. Accessibility and Inclusive Design

147. Провести formal WCAG audit with keyboard-only, screen reader and high-contrast checks.
148. Проверить focus order on every major flow.
149. Проверить ARIA labeling for answer groups, navigation, reports and dialogs.
150. Добавить skip links and landmark structure.
151. Проверить that all controls work without mouse.
152. Проверить mobile screen reader behavior.
153. Добавить reduced-motion support if animations are introduced.
154. Проверить color contrast in both dark and light themes.
155. Добавить accessible timing accommodations.
156. Добавить plain-language explanation for exam states.
157. Создать accessibility conformance note for current limitations.
158. Автоматизировать regression checks for accessibility-critical selectors.

## 14. Frontend Architecture

159. Оставить standalone HTML as portable build artifact.
160. Параллельно подготовить Vite/React or similar app shell for scalable development.
161. Разделить bank data, scoring engine, UI components, report generation and QA scripts.
162. Вынести scoring в pure functions with unit tests.
163. Вынести session state management into a dedicated module.
164. Добавить typed schemas for item bank, session, report and calibration data.
165. Добавить component-level tests for answer controls, navigation, review and reports.
166. Добавить route structure for candidate, evaluator and admin modes.
167. Добавить feature flags for beta-only tools.
168. Добавить build profiles: offline standalone, hosted candidate, hosted evaluator/admin.
169. Оптимизировать initial load for large bank size.
170. Добавить lazy loading or chunking for future 600+ item banks.

## 15. Backend and Data Model

171. Спроектировать minimal backend for hosted mode.
172. Добавить users, roles, cohorts, attempts, responses, item_bank_versions and reports tables.
173. Хранить candidate responses server-side for pilot calibration.
174. Хранить bank snapshots immutably once released.
175. Добавить API for starting attempt, fetching next item, submitting answer, finalizing attempt.
176. Добавить evaluator API for reading reports and adding comments.
177. Добавить admin API for bank management.
178. Добавить migration strategy.
179. Добавить database backup policy.
180. Добавить data retention policy for pilot responses.
181. Добавить privacy-safe anonymization for psychometric exports.
182. Подготовить local dev seed data.

## 16. QA and Regression Testing

183. Расширить HTML regression QA to include answer history, timing, report exports and role separation.
184. Добавить tests for randomized option mapping.
185. Добавить tests for randomized question order.
186. Добавить tests for exam integrity mode.
187. Добавить tests for learning mode and blind review mode.
188. Добавить tests for local save slots and restore.
189. Добавить mobile overflow tests for all main screens.
190. Добавить screenshot comparisons for desktop and mobile critical paths.
191. Добавить schema validation for all generated JSON outputs.
192. Добавить QA dashboard trend over time.
193. Добавить performance budget checks.
194. Добавить regression test for no external CDN dependency.
195. Добавить regression test for no secrets/no personal identities.
196. Добавить release gate script that fails if pending production blockers are mislabeled as done.

## 17. Performance and Offline Reliability

197. Измерить startup time for the 300-item bank.
198. Измерить memory usage during full exam session.
199. Оптимизировать embedded JSON payload if needed.
200. Проверить service worker update behavior.
201. Добавить cache version migration policy.
202. Добавить offline failure states.
203. Добавить local storage quota handling.
204. Добавить export backup reminder after long offline attempt.
205. Проверить app behavior after browser refresh, tab restore and storage clear.
206. Добавить performance report into QA dashboard.

## 18. Production Deployment

207. Подготовить hosted architecture decision: static-only beta, server-backed secure mode, or hybrid.
208. Настроить staging and production environments.
209. Добавить environment variable policy without committing secrets.
210. Добавить CI pipeline for build, lint, content audit, accessibility audit, browser QA and no-secret scan.
211. Добавить deployment checklist.
212. Добавить rollback procedure.
213. Добавить release notes per bank and app version.
214. Добавить production monitoring for errors and performance.
215. Добавить incident response notes for broken exam sessions.
216. Добавить uptime and data backup expectations.
217. Добавить clear beta warning until pilot calibration and expert sign-off are done.
218. Подготовить institutional demo package.

## 19. Documentation and Training

219. Написать candidate guide.
220. Написать evaluator guide.
221. Написать reviewer guide.
222. Написать admin/bank-maintainer guide.
223. Написать psychometric calibration guide.
224. Написать source policy guide.
225. Написать scoring methodology document.
226. Написать accessibility statement.
227. Написать known limitations page.
228. Написать release process page.
229. Написать how to add ACC_301-600 without repeating old patterns.
230. Подготовить one-page executive summary for non-technical stakeholders.

## 20. Next Bank Expansion

231. Перед генерацией ACC_301-600 утвердить new source set.
232. Сначала создать blueprint and source map, потом draft items.
233. Генерировать items in small batches, not one uncontrolled mass batch.
234. Запускать lint and semantic similarity audit after every batch.
235. Не допускать repeated source horizons beyond planned quota.
236. Вести review queue from the first batch, not after all 300 items.
237. Сравнивать new bank against ACC_001-300 for overlap.
238. Добавить new trap types only when they are explicitly defined.
239. Добавить new data-display patterns for Category C.
240. Подготовить cross-bank calibration plan.

## 21. Institutional Readiness

241. Подготовить professional validation packet: bank blueprint, source policy, review evidence, QA reports, calibration status and limitations.
242. Добавить sample candidate report and sample evaluator report.
243. Добавить demo cohort with synthetic data clearly labeled as synthetic.
244. Добавить pilot protocol: who participates, how data is collected, how consent/privacy is handled.
245. Подготовить risk register.
246. Подготовить fairness and bias review checklist.
247. Подготовить data protection note.
248. Подготовить operational playbook for a real test session.
249. Подготовить training material for evaluators.
250. После pilot and expert review update readiness from professional offline beta to controlled pilot release.

## 22. Immediate Next Sprint

251. DONE in ACC-C1C2-2026.7: Добавить answer history and per-item timing into the runtime session model.
252. DONE in ACC-C1C2-2026.7: Добавить confidence-adjusted score into visible analytics and exports.
253. DONE in ACC-C1C2-2026.7: Добавить separate candidate and evaluator report exports.
254. DONE in ACC-C1C2-2026.7: Сделать candidate mode cleaner by hiding service metadata and debug-like item chips.
255. DONE in ACC-C1C2-2026.7: Сделать mobile answer controls sticky.
256. DONE in ACC-C1C2-2026.7: Обновить QA scripts to verify answer history, timing, report exports and role separation.
257. DONE in ACC-C1C2-2026.7: Повысить schema version and changelog.
258. DONE in ACC-C1C2-2026.7: Перегенерировать outputs.
259. DONE in ACC-C1C2-2026.7: Прогнать content/source/accessibility/browser/hygiene audits.
260. DONE in ACC-C1C2-2026.7: Обновить QA dashboard and production readiness report.

## 23. Definition of Done for the Next Stage

261. All 300 items have human review status and no unresolved P1/P2 review blockers.
262. Pilot response data exists and psychometric report is based on real candidate rows.
263. Candidate report, evaluator report and admin protocol are generated from the same scoring schema.
264. Secure hosted mode hides answer keys from candidate delivery.
265. Accessibility has automated and manual evidence.
266. CI rejects broken bank schema, weak content regressions, external script drift, secrets and personal identity leaks.
267. Release notes clearly state what changed and what remains beta.
268. The project can be handed to another reviewer or developer without relying on hidden context.
