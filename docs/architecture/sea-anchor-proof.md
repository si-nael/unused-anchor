# Sea-Anchor Necessity Proof

## Status

This document replaces the earlier lightweight proof sketch with an observer-free analytic model.

It still does not claim to prove a metaphysical truth about all possible worlds.

It proves a narrower and more precise statement inside Bubble's intended mathematical model:

if Bubble is to represent an independent world that is open to exterior pressure, structurally situated among other worlds, and replay-identifiable as the same world, then three distinct semantic roles are forced by the model itself:

- negative sea
- positive sea
- anchor point

The proof below is written in the language of metric and Banach-space dynamical systems, comparison inequalities, and Lyapunov-style identity control.

## Scope

The proof is intentionally observer-free.

Observation maps may later be added as morphisms from a bubble world into an evidence space, but they do not appear in the primitive object defined here.

So the resulting notion of worldhood is ontic before it is epistemic.

## 1. Primitive Analytic Model

Fix a separable Banach space $(\mathbb{B}, \|\cdot\|)$.

Here $t$ and the horizon $T$ are analytic path parameters used by this particular continuous model. They do not assert that every Bubble world possesses one universal physical clock. A discrete world may instead be stationary, reversible, cyclic, only partially causally ordered, or history-directed only after an irreversible commitment. The `v0.5` runtime keeps those cases separate rather than deriving ontology from the notation of this proof.

For an analytic path horizon $T > 0$, an observer-free bubble world is a tuple

$$
\mathfrak{B}_T = (X, F, \Sigma, \mathcal{C}_T, \delta)
$$

with the following data.

### 1.1 State space

$X \subset \mathbb{B}$ is a nonempty closed set.

Its points are admissible local states of one bubble world.

### 1.2 Internal law field

$F : X \to \mathbb{B}$ is locally Lipschitz.

So the autonomous internal law equation

$$
x'(t) = F(x(t))
$$

is well posed on every compact subinterval where the solution remains in $X$.

### 1.3 Admissible trajectories

$\mathcal{C}_T \subset AC([0,T]; X)$ is the set of admissible world trajectories on $[0,T]$.

Here $AC([0,T]; X)$ denotes absolutely continuous paths with values in $X$.

### 1.4 Structural continuation family

$\Sigma$ is a nonempty family of continuous maps

$$
\sigma : X \to Y_\sigma
$$

into metric spaces $Y_\sigma$ representing lineage, placement, or continuation structure.

Each $\sigma \in \Sigma$ carries a continuous support density

$$
p_\sigma : X \to [0, \infty)
$$

that measures how strongly that continuation relation structurally supports the current world state.

### 1.5 Identity defect

$\delta : X \times X \to [0, \infty)$ is a lower semicontinuous identity-defect functional.

It satisfies

$$
\delta(x,y) = 0 \iff x \sim y,
$$

where $\sim$ is the same-world equivalence relation induced by replay identity.

So $\delta$ is not an observation error. It is an ontic defect measure for world identity.

## 2. Worldhood Axioms

The analytic model is governed by three axioms.

### Axiom O: Openness

For every $T > 0$, there exists at least one admissible trajectory $x \in \mathcal{C}_T$ and at least one nonzero forcing term

$$
u \in L^1([0,T]; \mathbb{B}), \qquad u \not\equiv 0,
$$

such that

$$
x'(t) = F(x(t)) + u(t)
$$

for almost every $t \in [0,T]$.

Interpretation: the world is not a totally closed autonomous subsystem. Admissible exterior pressure exists.

### Axiom S: Situatedness

For every nonempty relatively open subset $U \subset X$, there exists at least one $\sigma \in \Sigma$ such that

$$
p_\sigma(x) > 0 \quad \text{for some } x \in U.
$$

Interpretation: the world is not an isolated atom. It is situated within lineage, placement, or continuation structure that supports it somewhere locally.

### Axiom I: Robust Replay-Identifiability

For every reference trajectory $x_* \in \mathcal{C}_T$, there exist measurable functions

$$
a_{x_*}, n_{x_*}, p_{x_*} \in L^1([0,T]; [0,\infty))
$$

with $a_{x_*} \not\equiv 0$ such that every admissible trajectory $x \in \mathcal{C}_T$, with identity defect

$$
\Delta_x(t) := \delta(x(t), x_*(t)),
$$

satisfies the upper Dini derivative bound

$$
D^+ \Delta_x(t) \le n_{x_*}(t) - p_{x_*}(t) - a_{x_*}(t) \Delta_x(t)
$$

for almost every $t \in [0,T]$.

Interpretation: replay identity is not merely a label. It is robustly stabilizable against disturbance by a genuine contractive term.

## 3. Derived Semantic Objects

The three sea-anchor objects are now derived, not postulated by name.

### 3.1 Negative sea

For each $T > 0$, define the admissible forcing set

$$
\mathcal{N}_T := \{u \in L^1([0,T]; \mathbb{B}) : \exists x \in \mathcal{C}_T,\ x'(t)=F(x(t))+u(t) \text{ a.e.}\}.
$$

Define the negative sea as the closed cone

$$
\mathcal{N} := \overline{\bigcup_{T>0} \mathcal{N}_T}^{\ L^1_{\mathrm{loc}}}.
$$

This is the analytically precise version of exterior dissolving pressure.

### 3.2 Positive sea

Define the positive sea support family

$$
\mathcal{P} := \{p_\sigma : \sigma \in \Sigma\} \subset C(X, [0,\infty)).
$$

This is the analytically precise version of lineage, placement, and continuation support.

### 3.3 Anchor point

For each reference trajectory $x_*$, define the admissible anchor-rate class

$$
\mathcal{A}(x_*) := \left\{ a \in L^1([0,T]; [0,\infty)) : D^+\Delta_x \le n - p - a\Delta_x \text{ a.e. for all } x \in \mathcal{C}_T \right\}.
$$

Any nontrivial member of $\mathcal{A}(x_*)$ is an anchor rate.

It is the analytically precise version of identity-fixation against disturbance.

## 4. Theorem 1: Necessity And Irreducibility

### Theorem 1 Statement

If $\mathfrak{B}_T$ satisfies Axioms O, S, and I, then:

1. $\mathcal{N}$ is nontrivial.
2. $\mathcal{P}$ is nontrivial.
3. For every reference trajectory $x_*$, $\mathcal{A}(x_*)$ contains a nonzero element.

Hence negative sea, positive sea, and anchor point are necessary semantic roles.

Moreover they are irreducible: removing any one of them destroys a different axiom.

### Theorem 1 Proof

By Axiom O, for every $T > 0$ there exists at least one admissible nonzero forcing term $u$ with

$$
x'(t)=F(x(t))+u(t)
$$

for some admissible trajectory $x$.

Therefore $\mathcal{N}_T$ is nonempty for every $T$, so its local $L^1$ closure $\mathcal{N}$ is nontrivial.

If $\mathcal{N}$ were trivial, then every admissible trajectory would satisfy $x'=F(x)$ almost everywhere. That contradicts Axiom O. So negative sea is necessary.

By Axiom S, for every nonempty relatively open $U \subset X$, some support density $p_\sigma$ is strictly positive somewhere on $U$. Hence $\Sigma$ is nonempty and $\mathcal{P}$ contains a nonzero function.

If $\mathcal{P}$ were trivial, then no local region of $X$ would carry positive structural support from lineage or placement. That contradicts Axiom S. So positive sea is necessary.

By Axiom I, for every reference trajectory $x_*$ there exists a measurable $a_{x_*} \in L^1([0,T]; [0,\infty))$ with $a_{x_*} \not\equiv 0$ satisfying the defect inequality. Therefore $\mathcal{A}(x_*)$ contains a nonzero element.

If every anchor-rate class were trivial, then replay identity would satisfy only

$$
D^+\Delta_x(t) \le n_{x_*}(t) - p_{x_*}(t),
$$

with no contractive identity term. Under arbitrarily small positive forcing, there would be no intrinsic restoring mechanism separating same-world replay from nearby but nonidentical states. That contradicts robust replay-identifiability. So anchor is necessary.

Irreducibility follows because each role is tied to a different axiom:

- removing $\mathcal{N}$ breaks openness
- removing $\mathcal{P}$ breaks situatedness
- removing $\mathcal{A}$ breaks replay-identifiability

Therefore the three roles are jointly necessary and semantically irreducible.

## 5. Theorem 2: Analytic Identity Bound

### Theorem 2 Statement

Fix a reference trajectory $x_* \in \mathcal{C}_T$ and an admissible trajectory $x \in \mathcal{C}_T$.

Let

$$
\Delta(t) := \delta(x(t), x_*(t)).
$$

Assume

$$
D^+\Delta(t) \le n(t) - p(t) - a(t)\Delta(t)
$$

for almost every $t \in [0,T]$, where $n,p,a \in L^1([0,T]; [0,\infty))$.

Define

$$
A(t) := \int_0^t a(s)\, ds.
$$

Then for every $t \in [0,T]$,

$$
\Delta(t) \le e^{-A(t)}\Delta(0) + \int_0^t e^{-(A(t)-A(s))}(n(s)-p(s))_+\, ds.
$$

### Theorem 2 Proof

Because $\Delta$ is absolutely continuous and $a \in L^1$, the integrating factor $e^{A(t)}$ is absolutely continuous.

Set

$$
Y(t) := e^{A(t)}\Delta(t).
$$

By the product rule for absolutely continuous functions and the defect inequality,

$$
D^+Y(t) = e^{A(t)}\left(D^+\Delta(t) + a(t)\Delta(t)\right)
\le e^{A(t)}(n(t)-p(t)).
$$

Since $(n-p) \le (n-p)_+$ pointwise, we obtain

$$
D^+Y(t) \le e^{A(t)}(n(t)-p(t))_+.
$$

Integrating from $0$ to $t$ gives

$$
Y(t) \le Y(0) + \int_0^t e^{A(s)}(n(s)-p(s))_+\, ds.
$$

Substituting $Y(0)=\Delta(0)$ and dividing by $e^{A(t)}$ yields

$$
\Delta(t) \le e^{-A(t)}\Delta(0) + \int_0^t e^{-(A(t)-A(s))}(n(s)-p(s))_+\, ds.
$$

This proves the bound.

## 6. Corollary: Persistence Under Uniform Anchor Strength

Assume the hypotheses of Theorem 2 and additionally that

$$
a(t) \ge a_0 > 0 \quad \text{a.e. on } [0,T],
$$

and

$$
(n(t)-p(t))_+ \le \eta \quad \text{a.e. on } [0,T].
$$

Then

$$
\Delta(t) \le e^{-a_0 t}\Delta(0) + \frac{\eta}{a_0}(1-e^{-a_0 t}).
$$

### Corollary Proof

From Theorem 2,

$$
\Delta(t) \le e^{-a_0 t}\Delta(0) + \int_0^t e^{-a_0(t-s)}\eta\, ds.
$$

Compute the convolution integral explicitly:

$$
\int_0^t e^{-a_0(t-s)}\eta\, ds = \frac{\eta}{a_0}(1-e^{-a_0 t}).
$$

Substituting gives the claimed estimate.

So a positive anchor rate and bounded excess negative pressure imply quantitative same-world stability.

## 7. Theorem 3: Observer-Independence Of Worldhood

### Theorem 3 Statement

Let $O_1 : X \to Z_1$ and $O_2 : X \to Z_2$ be any two observation maps into arbitrary evidence spaces.

Then the existence of $\mathcal{N}$, $\mathcal{P}$, $\mathcal{A}(x_*)$, and the bounds of Theorem 2 are unchanged by replacing $O_1$ with $O_2$.

### Theorem 3 Proof

No observation map appears in the primitive tuple $\mathfrak{B}_T = (X,F,\Sigma,\mathcal{C}_T,\delta)$.

No observation map appears in Axioms O, S, or I.

Therefore the derived objects $\mathcal{N}$, $\mathcal{P}$, and $\mathcal{A}(x_*)$ are defined entirely from world dynamics, structural continuation, and identity defect.

So changing observation maps does not alter their existence or the comparison inequality.

Hence worldhood in this model is observer-independent.

## 8. Continuous Worldhood Margin

For any admissible interval $[0,T]$, define averaged intensities

$$
\bar N_T := \frac{1}{T}\int_0^T n(s)\, ds, \qquad
\bar P_T := \frac{1}{T}\int_0^T p(s)\, ds, \qquad
\bar A_T := \frac{1}{T}\int_0^T a(s)\, ds.
$$

Define the continuous worldhood margin and identity margin by

$$
W_T := \bar A_T + \bar P_T - \bar N_T,
$$

$$
J_T := \bar A_T - \bar N_T.
$$

These are the continuous analytic objects behind the current discrete runtime witness.

Interpretation:

- $W_T > 0$ means structural support plus anchor contraction dominates average dissolving pressure on $[0,T]$
- $J_T > 0$ means identity fixation dominates average dissolving pressure on $[0,T]$

## 9. Implementation Mapping And Present Gap

The current runtime does not yet compute the continuous functions $n(t)$, $p(t)$, and $a(t)$ directly.

Instead it computes a coarse three-level quantization of proxy signals.

Current ordinal mapping:

- negative sea: `low -> 0`, `elevated -> 1`, `high -> 2`
- positive sea: `weak -> 0`, `present -> 1`, `strong -> 2`
- anchor point: `weak -> 0`, `steady -> 1`, `strong -> 2`

This quantization is a coarse runtime witness for the continuous quantities $(\bar N_T, \bar P_T, \bar A_T)$, not the full analytic model itself.

The current implementation also still mixes some ontic and epistemic signals, especially where observation support or durable history are used as part of anchor estimation.

So the rigorous analytic model is now ahead of the current runtime in one important way:

- the proof defines worldhood independently of any observer map
- the runtime still contains some observer-adjacent proxies in its coarse estimator

That gap is now explicit rather than hidden.

## 10. Conclusion

Inside this analytic model, negative sea, positive sea, and anchor point are not optional metaphors.

They are the three mathematically forced roles generated by:

- openness to exterior pressure
- situatedness inside a larger structured field
- robust replay-identifiability of the same world

That is the sense in which the sea-anchor triad is necessary for Bubble rather than merely useful.
