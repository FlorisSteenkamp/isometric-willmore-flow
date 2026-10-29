# Fairing

*Isometric Willmore flow of closed planar curves, in the browser.*

**[▶ Live demo](https://florissteenkamp.github.io/isometric-willmore-flow/)**

This is an interactive demo of the curve flow from Section 5 of
[**Robust Fairing via Conformal Curvature Flow**](https://www.cs.cmu.edu/~kmcrane/Projects/ConformalWillmoreFlow/) by
**Keenan Crane, Ulrich Pinkall and Peter Schröder** (ACM Transactions on
Graphics 32(4), SIGGRAPH 2013).

The method, its discretization and the algorithm implemented here (Table 1 of
the paper) are entirely theirs. This project is only a TypeScript
re-implementation, written to see the flow in action. If it's useful to you,
please cite their paper and not this repository:

```bibtex
@article{Crane:2013:RFC,
    author  = {Keenan Crane and Ulrich Pinkall and Peter Schr{\"o}der},
    title   = {Robust Fairing via Conformal Curvature Flow},
    journal = {ACM Transactions on Graphics},
    volume  = {32},
    number  = {4},
    year    = {2013}
}
```


## The idea (from the paper)

Most fairing methods move the *positions* of a curve, so their stable time step
shrinks with the mesh size. Crane, Pinkall and Schröder flow the *curvature*
instead and rebuild the curve from it:

1. measure the curvature `κ` at each vertex
2. take the gradient flow of the Willmore energy, which in curvature space is
   simply `κ̇ = -2κ`
3. project out the parts that would change the total curvature or open the
   curve (the constraints `{1, f_x, f_y}`)
4. integrate the new curvature back to tangents, using the original edge
   lengths, so the flow is isometric by construction
5. recover the positions with a small Poisson solve that closes the curve

Every frequency of the curvature decays at the same rate. As a result any
closed curve, however wrinkly, flows to a round circle of the same length in a
predictable number of steps.


## What the demo adds

The flow itself is from the paper. The demo only adds a little plumbing
around it to make it nice to watch:

* **Steps until round:** each step multiplies the unconstrained curvature by
  `1 - 2τ`. The number of steps is therefore fixed by the time step:
  `N = ln ε / ln(1 - 2τ)` steps leave the fraction `ε` (1%). This is exact for
  the linearized flow and very close in practice.
* **Morph:** the steps are computed once as keyframes. A point between
  keyframes `j` and `j+1` is a single partial step of `s·τ` from keyframe `j`,
  so scrubbing or playing is cheap and always gives the same shape for the
  same slider position. A step of zero isn't quite the identity, because
  rebuilding with the original edge lengths removes a keyframe's small length
  drift. That correction is blended in across the step so the morph has no
  jumps.


## Running it

```
npm install
npm run dev
```

`npm run dev` watches and rebuilds the bundle, type-checks in the background,
and serves the page at <http://127.0.0.1:5502/index.html>.

Run the tests with `npm test`.

### Controls

* **Shape:** the curve to flow (see [Shapes](#shapes))
* **Morph:** play/pause, and the point between the original (0) and round (1)
* **Vertices:** the number of polygon vertices, shared among the loops by
  length
* **Time step τ:** smaller steps are more accurate (edge lengths stay closer to
  the original ones) but need more of them
* **Steps:** the number of steps until round, which follows from `τ`
* **Show:** the original shape and the vertices

The stats line shows the Willmore energy, the curvature still left, and the
largest relative change in edge length, which measures how isometric the
discrete flow really is.


## Code

The flow lives in `src/fair/`, one function per file, following Table 1 of the
paper:

* `isometric-willmore-step.ts`: one explicit Euler step in curvature space
  (stable for `τ < 1`)
* `gram-schmidt.ts`: the orthonormal constraint basis
* `recover-positions.ts`: the Poisson solve that closes the curve (Section
  5.2)
* `align-rigidly.ts`: removes the mean change in position and angle
* `fair-loop.ts`, `fair-shape.ts`: multiple steps, multiple loops
* `resample-loop.ts`: bezier loop to an evenly spaced polygon
* `willmore-energy.ts`: the discrete Willmore energy
* `morph-frame.ts`, `remaining-curvature.ts`: the demo's morph and the
  steps-until-round estimate

The page (React) is in `src/page/`. The tests in `__tests__/` check the paper's
claims on simple shapes: circles stay fixed, the energy decreases
monotonically, edge lengths and turning number are preserved, the length
error converges quadratically in the time step (Figure 11), and the flow is
unstable for `τ > 1`.


## Shapes

All test shapes are stored as `<glyph>` elements of one SVG font,
[`html/vectors/vectors.svg`](html/vectors/vectors.svg).

The `zoo-` shapes are silhouettes from [PhyloPic](https://www.phylopic.org),
by their many individual contributors. They were copied from the
mega-morphic demo. Each glyph's artist, license and source link are given in
a comment directly above it. Most are CC0, but some are CC BY, CC BY-SA,
CC BY-NC or CC BY-NC-SA, so check a glyph's own license before reusing it.


## Credits and further reading

* **Keenan Crane, Ulrich Pinkall and Peter Schröder:**
  [Robust Fairing via Conformal Curvature Flow](https://www.cs.cmu.edu/~kmcrane/Projects/ConformalWillmoreFlow/),
  ACM Transactions on Graphics 32(4), SIGGRAPH 2013. The method implemented
  here; the project page has the paper and its video.
* **Keenan Crane:** [Discrete Differential Geometry: An Applied
  Introduction](https://www.cs.cmu.edu/~kmcrane/Projects/DDG/), course notes.
  The isometric Willmore flow of curves was also a homework exercise in his
  DDG course; the
  [assignment](https://web.archive.org/web/20190130092915/http://brickisland.net/cs177fa12/?cat=3)
  survives on the Wayback Machine (its skeleton code is © 2011 Keenan Crane,
  BSD license).
* **[ialhashim](https://github.com/ialhashim) on GitHub:** another
  [implementation](https://github.com/ialhashim/calligram-dev/blob/9b179ce7e1b61f4ffdc8afcfa43b1dc9d80736e6/archive/IsometricWillmoreFlow1D/IsometricWillmoreFlow1D.cpp)
  of the same flow, in C++.
* **Etienne Vouga:** *Lectures in Discrete Differential Geometry 1: Plane
  Curves* (2014). Background on discrete curvature of plane curves.
* **Joel Hass and Peter Scott:** *Shortening Curves on Surfaces*, Topology
  33(1), 1994. Background on curve shortening.
* **PhyloPic contributors:** the `zoo-` silhouettes (see [Shapes](#shapes)).


## License

The demo's own code is MIT licensed (see `package.json`). The works credited
above and the shapes in `html/vectors/` remain under their authors' own
copyrights and licenses.
