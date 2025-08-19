import { window, document } from './mocks/dom.mock.js';
const utils = require('../public/scripts/utils.js');
const domUtils = require('../public/scripts/dom-utils.js');

jest.mock('virtual-scroller/dom', () => {
  return jest.fn().mockImplementation(() => ({ setItems: jest.fn() }));
});
jest.mock('../public/scripts/icons.js', () => ({
  createListElement: jest.fn(() => ({
    /* node */
  })),
}));

const VirtualScroller = require('virtual-scroller/dom');
const initVirtualWindow =
  require('../public/scripts/virtual-window.js').default;

describe('virtual-window', () => {
  let getBadges;
  const initialBadges = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

  beforeEach(() => {
    window.__resetAllMocks();
    document.__resetAllMocks();

    getBadges = jest.fn(() => initialBadges).mockName('getBadges');
    jest.spyOn(domUtils, 'getColumnsCount').mockReturnValue(2);
    jest.spyOn(utils, 'groupIntoRows');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws error when container not found', () => {
    document.getElementById.mockReturnValue(null);
    expect(() => initVirtualWindow(window, document, getBadges)).toThrowError();
  });

  it('initializes VirtualScroller', () => {
    const container = { id: 'virtual-list', clientWidth: 800 };
    document.getElementById.mockReturnValue(container);

    const { virtualWindowContainer } = initVirtualWindow(
      window,
      document,
      getBadges,
    );
    expect(VirtualScroller).toHaveBeenCalled();
    expect(virtualWindowContainer).toBe(container);
  });

  it('wires resize regrouping', () => {
    const container = { id: 'virtual-list', clientWidth: 800 };
    document.getElementById.mockReturnValue(container);

    const { scroller } = initVirtualWindow(window, document, getBadges);
    jest.spyOn(scroller, 'setItems');

    const listener = window.addEventListener.mock.calls.find(
      (c) => c[0] === 'resize',
    )[1];

    // without changing the column count
    domUtils.getColumnsCount.mockReturnValue(2);
    listener();
    expect(scroller.setItems).not.toHaveBeenCalled();

    // with changing the column count
    domUtils.getColumnsCount.mockReturnValue(5);
    listener();
    expect(scroller.setItems).toHaveBeenCalled();
  });
});
