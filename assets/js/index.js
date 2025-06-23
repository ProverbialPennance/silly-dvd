document.addEventListener("DOMContentLoaded", () => {
    init_cross_frame_state();
    attachListeners();

    console.log("event listeners attached");
});

const getMoveable = () => document.getElementById("bouncer");

function attachListeners() {
    window.requestAnimationFrame(animation_step);
}

const cross_frame_state = new Map();

function init_cross_frame_state() {
    const ele = getMoveable();
    const state = {
            start: undefined,
            time: undefined,
            timescale_factor: 3.0 + 1.0/3.0,
            y_up: Boolean(Math.round(Math.random())),
            x_right: Boolean(Math.round(Math.random())),
            x: clamp(getRandomIntInclusive(0, window.visualViewport.width), 0, window.visualViewport.width - ele.getClientRects()[0].width),
            y: clamp(getRandomIntInclusive(0, window.visualViewport.height), 0, window.visualViewport.height - ele.getClientRects()[0].height)
        };
    cross_frame_state.set(
        ele.id,
        state
    );
    ele.style.translate = `${state.x}px ${state.y}px`
    ele.classList.remove("hidden");
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

function valid_bounds_for(target_rect) {
    return [
        0, 0,
        window.visualViewport.width - target_rect.width,
        window.visualViewport.height - target_rect.height,
    ]
}


function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

// TODO acceleration? collision detection between elements
function animation_step(time) {
    const moveable = getMoveable();
    const state = cross_frame_state.get(moveable.id);
    if (!state.time)
    {
        state.start = time;
        state.time = time;
    }
    state.time = time;
    const delta = state.start / state.time;
    state.start = time;

    const viewport_height = window.visualViewport.height;
    const viewport_width = window.visualViewport.width;
    const moveable_rect = moveable.getClientRects()[0];

    const valid_bounds = [
        0,
        0, 
        viewport_width - moveable_rect.width,
        viewport_height - moveable_rect.height,
    ];
    
    let speed = (2.0 * state.timescale_factor) / Math.SQRT2;
    
    let x = moveable_rect.x;
    let y = moveable_rect.y;

    // dvd animation movement
    if (state.x_right) {
            let dist = Math.abs((x + speed) - x)
            x += dist * delta;
        } else {
            let dist = Math.abs((x - speed) - x);
            x -= dist * delta;
        }

        if (!state.y_up) {
            let dist = Math.abs((y + speed) - y);
            y += dist * delta;
        } else {
            let dist = Math.abs((y -speed) - y);
            y -= dist * delta;
        }

        if (x <= 0) {
            state.x_right = true;
        } else if (x >= (valid_bounds[2])) {
            state.x_right = false;
        }

        if (y <= 0) {
            state.y_up = false;
        } else if (y >= (valid_bounds[3])) {
            state.y_up = true;
        }

    x = clamp(x, valid_bounds[0], valid_bounds[2]);
    y = clamp(y, valid_bounds[1], valid_bounds[3]);

    moveable.style.translate = `${x}px ${y}px`;

    window.requestAnimationFrame(animation_step);
}