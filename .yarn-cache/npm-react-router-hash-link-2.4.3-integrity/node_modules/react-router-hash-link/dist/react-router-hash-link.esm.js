import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

var hashFragment = '';
var observer = null;
var asyncTimerId = null;
var scrollFunction = null;
function reset() {
    hashFragment = '';
    if (observer !== null)
        observer.disconnect();
    if (asyncTimerId !== null) {
        window.clearTimeout(asyncTimerId);
        asyncTimerId = null;
    }
}
function isInteractiveElement(element) {
    var formTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    var linkTags = ['A', 'AREA'];
    return ((formTags.includes(element.tagName) && !element.hasAttribute('disabled')) ||
        (linkTags.includes(element.tagName) && element.hasAttribute('href')));
}
function getElAndScroll() {
    var element = null;
    if (hashFragment === '#') {
        // use document.body instead of document.documentElement because of a bug in smoothscroll-polyfill in safari
        // see https://github.com/iamdustan/smoothscroll/issues/138
        // while smoothscroll-polyfill is not included, it is the recommended way to implement smoothscroll
        // in browsers that don't natively support el.scrollIntoView({ behavior: 'smooth' })
        element = document.body;
    }
    else {
        // check for element with matching id before assume '#top' is the top of the document
        // see https://html.spec.whatwg.org/multipage/browsing-the-web.html#target-element
        var id = hashFragment.replace('#', '');
        element = document.getElementById(id);
        if (element === null && hashFragment === '#top') {
            // see above comment for why document.body instead of document.documentElement
            element = document.body;
        }
    }
    if (element !== null) {
        scrollFunction(element);
        // update focus to where the page is scrolled to
        // unfortunately this doesn't work in safari (desktop and iOS) when blur() is called
        var originalTabIndex = element.getAttribute('tabindex');
        if (originalTabIndex === null && !isInteractiveElement(element)) {
            element.setAttribute('tabindex', -1);
        }
        element.focus({ preventScroll: true });
        if (originalTabIndex === null && !isInteractiveElement(element)) {
            // for some reason calling blur() in safari resets the focus region to where it was previously,
            // if blur() is not called it works in safari, but then are stuck with default focus styles
            // on an element that otherwise might never had focus styles applied, so not an option
            element.blur();
            element.removeAttribute('tabindex');
        }
        reset();
        return true;
    }
    return false;
}
function hashLinkScroll(timeout) {
    // Push onto callback queue so it runs after the DOM is updated
    window.setTimeout(function () {
        if (getElAndScroll() === false) {
            if (observer === null) {
                observer = new MutationObserver(getElAndScroll);
            }
            observer.observe(document, {
                attributes: true,
                childList: true,
                subtree: true,
            });
            // if the element doesn't show up in specified timeout or 10 seconds, stop checking
            asyncTimerId = window.setTimeout(function () {
                reset();
            }, timeout || 10000);
        }
    }, 0);
}
function genericHashLink(As) {
    return React.forwardRef(function (props, ref) {
        var linkHash = '';
        if (typeof props.to === 'string' && props.to.includes('#')) {
            linkHash = "#" + props.to.split('#').slice(1).join('#');
        }
        else if (typeof props.to === 'object' &&
            typeof props.to.hash === 'string') {
            linkHash = props.to.hash;
        }
        var passDownProps = {};
        if (As === NavLink) {
            passDownProps.isActive = function (match, location) {
                return match && match.isExact && location.hash === linkHash;
            };
        }
        function handleClick(e) {
            reset();
            hashFragment = props.elementId ? "#" + props.elementId : linkHash;
            if (props.onClick)
                props.onClick(e);
            if (hashFragment !== '' &&
                // ignore non-vanilla click events, same as react-router
                // below logic adapted from react-router: https://github.com/ReactTraining/react-router/blob/fc91700e08df8147bd2bb1be19a299cbb14dbcaa/packages/react-router-dom/modules/Link.js#L43-L48
                !e.defaultPrevented && // onClick prevented default
                e.button === 0 && // ignore everything but left clicks
                (!props.target || props.target === '_self') && // let browser handle "target=_blank" etc
                !(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) // ignore clicks with modifier keys
            ) {
                scrollFunction =
                    props.scroll ||
                        (function (el) {
                            return props.smooth
                                ? el.scrollIntoView({ behavior: 'smooth' })
                                : el.scrollIntoView();
                        });
                hashLinkScroll(props.timeout);
            }
        }
        var filteredProps = __rest(props, ["scroll", "smooth", "timeout", "elementId"]);
        return (React.createElement(As, __assign({}, passDownProps, filteredProps, { onClick: handleClick, ref: ref }), props.children));
    });
}
var HashLink = genericHashLink(Link);
var NavHashLink = genericHashLink(NavLink);
if (process.env.NODE_ENV !== 'production') {
    HashLink.displayName = 'HashLink';
    NavHashLink.displayName = 'NavHashLink';
    var propTypes = {
        onClick: PropTypes.func,
        children: PropTypes.node,
        scroll: PropTypes.func,
        timeout: PropTypes.number,
        elementId: PropTypes.string,
        to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    };
    HashLink.propTypes = propTypes;
    NavHashLink.propTypes = propTypes;
}

export { HashLink, NavHashLink, genericHashLink };
//# sourceMappingURL=react-router-hash-link.esm.js.map
