const {
  document,
  newElementMock,
  newEventMock,
} = require('./mocks/dom.mock.js');
const { localStorage } = require('./mocks/local-storage.mock.js');

const initOrdering = require('../public/scripts/ordering.js').default;
const { STORAGE_KEY_ORDERING } = require('../public/scripts/storage.js');
const { ORDER_ALPHABETICALLY, ORDER_BY_COLOR, ORDER_BY_RELEVANCE } = require('../public/scripts/ordering')

describe('Ordering', () => {
  beforeEach(() => {
    document.__resetAllMocks();
    localStorage.__resetAllMocks();
  });

  it('gets the #order-alpha button', () => {
    localStorage.__setStoredValueFor(STORAGE_KEY_ORDERING, 'unknown');

    const eventListeners = new Map();

    const $orderAlphabetically = newElementMock('#order-alpha');
    $orderAlphabetically.addEventListener.mockImplementation((name, fn) => {
      eventListeners.set(name, fn);
    });

    document.getElementById.mockImplementation((query) => {
      if (query === 'order-alpha') {
        return $orderAlphabetically;
      }

      return newElementMock(query);
    });

    initOrdering(document, localStorage);
    expect(document.getElementById).toHaveBeenCalledWith('order-alpha');
    expect($orderAlphabetically.disabled).toBe(false);
    expect($orderAlphabetically.addEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
    );

    localStorage.setItem.mockClear();

    const clickListener = eventListeners.get('click');
    const event = newEventMock();
    clickListener(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY_ORDERING,
      'alphabetically',
    );
  });

  it('gets the #order-color button', () => {
    localStorage.__setStoredValueFor(STORAGE_KEY_ORDERING, 'unknown');

    const eventListeners = new Map();

    const $orderByColor = newElementMock('#order-color');
    $orderByColor.addEventListener.mockImplementation((name, fn) => {
      eventListeners.set(name, fn);
    });

    document.getElementById.mockImplementation((query) => {
      if (query === 'order-color') {
        return $orderByColor;
      }

      return newElementMock(query);
    });

    initOrdering(document, localStorage);
    expect(document.getElementById).toHaveBeenCalledWith('order-color');
    expect($orderByColor.disabled).toBe(false);
    expect($orderByColor.addEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
    );

    localStorage.setItem.mockClear();

    const clickListener = eventListeners.get('click');
    const event = newEventMock();
    clickListener(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY_ORDERING,
      'color',
    );
  });

  it('gets the #order-relevance button', () => {
    const eventListeners = new Map();

    const $orderByRelevance = newElementMock('#order-relevance');
    $orderByRelevance.addEventListener.mockImplementation((name, fn) => {
      eventListeners.set(name, fn);
    });

    document.getElementById.mockImplementation((query) => {
      if (query === 'order-relevance') {
        return $orderByRelevance;
      }

      return newElementMock(query);
    });

    initOrdering(document, localStorage);
    expect(document.getElementById).toHaveBeenCalledWith('order-relevance');
    expect($orderByRelevance.disabled).toBe(false);
    expect($orderByRelevance.addEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
    );

    const clickListener = eventListeners.get('click');
    const event = newEventMock();
    clickListener(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('uses alphabetical ordering if no value is stored', () => {
    initOrdering(document, localStorage);
    expect(localStorage.hasItem).toHaveBeenCalledWith(STORAGE_KEY_ORDERING);
    expect(localStorage.getItem).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses the stored value "alphabetically"', () => {
    const storedValue = 'alphabetically';
    localStorage.__setStoredValueFor(STORAGE_KEY_ORDERING, storedValue);

    initOrdering(document, localStorage);
    expect(localStorage.hasItem).toHaveBeenCalledWith(STORAGE_KEY_ORDERING);
    expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY_ORDERING);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('uses the stored value "color"', () => {
    const storedValue = 'color';
    localStorage.__setStoredValueFor(STORAGE_KEY_ORDERING, storedValue);

    initOrdering(document, localStorage);
    expect(localStorage.hasItem).toHaveBeenCalledWith(STORAGE_KEY_ORDERING);
    expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY_ORDERING);
    expect(document.$body.classList.add).toHaveBeenCalledWith('order-by-color');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY_ORDERING,
      storedValue,
    );
  });

  describe('Badge Sorting Logic', () => {
    let orderControls;
    let badges;

    beforeEach(() => {
      orderControls = initOrdering(document, localStorage);
      badges = [
        { title: 'Bravo', indexByAlpha: 2, indexByColor: 2, relevanceScore: 20 },
        { title: 'Alpha', indexByAlpha: 1, indexByColor: 3, relevanceScore: 10 },
        { title: 'Zulu', indexByAlpha: 10, indexByColor: 1, relevanceScore: 30 },]
    });

    it('sorts by alphabetical (default)', () => {
      const byAlpha = orderControls.sortBadges(badges);
      expect(byAlpha.map(i => i.title)).toEqual(['Alpha', 'Bravo', 'Zulu']);
    });

    it('sorts by color', () => {
      const byColor = orderControls.sortBadges(badges, ORDER_BY_COLOR);
      expect(byColor.map(i => i.indexByColor)).toEqual([1, 2, 3]);
    });

    it('sorts by relevance', () => {
      const byRelevance = orderControls.sortBadges(badges, ORDER_BY_RELEVANCE);
      expect(byRelevance.map(i => i.relevanceScore)).toEqual([10, 20, 30]);
    });

    it('does not mutate the original array', () => {
      orderControls.sortBadges(badges);
      orderControls.sortBadges(badges, ORDER_BY_COLOR);
      orderControls.sortBadges(badges, ORDER_BY_RELEVANCE);
      expect(badges.map(i => i.title)).toEqual(['Bravo', 'Alpha', 'Zulu']);
    })
  });

  it('calls callback (onOrderChange) on user selection', () => {
    const eventListeners = new Map();
    const $alpha = newElementMock('#order-alpha');
    const $color = newElementMock('#order-color');
    const $relevance = newElementMock('#order-relevance');

    $alpha.addEventListener.mockImplementation((n, fn) => eventListeners.set(`a:${n}`, fn));
    $color.addEventListener.mockImplementation((n, fn) => eventListeners.set(`c:${n}`, fn));
    $relevance.addEventListener.mockImplementation((n, fn) => eventListeners.set(`r:${n}`, fn));

    document.getElementById.mockImplementation((id) => {
      if (id === 'order-alpha') return $alpha;
      if (id === 'order-color') return $color;
      if (id === 'order-relevance') return $relevance;
      return newElementMock(id);
    });

    const getBadges = jest.fn();
    const onOrderChange = jest.fn();
    initOrdering(document, localStorage, getBadges, onOrderChange);

    // click color => callback with 'color'
    eventListeners.get('c:click')({ preventDefault: jest.fn() });
    expect(onOrderChange).toHaveBeenCalled();

    // click relevance => call callback and without recording in storage
    localStorage.setItem.mockClear();
    eventListeners.get('r:click')({ preventDefault: jest.fn() });
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(onOrderChange).toHaveBeenCalled();
  });

  it('calls callback (onOrderChange) during init if storage has a value', () => {
    localStorage.__setStoredValueFor(STORAGE_KEY_ORDERING, ORDER_BY_COLOR);
    const getBadges = jest.fn();
    const onOrderChange = jest.fn();

    initOrdering(document, localStorage, getBadges, onOrderChange);
    expect(onOrderChange).toHaveBeenCalled();
  });

  it('does nothing when selecting the same ordering again', () => {
    const getBadges = jest.fn();
    const onOrderChange = jest.fn();
    const orderControls = initOrdering(document, localStorage, getBadges, onOrderChange);

    // by default alphabetically
    onOrderChange.mockClear();
    orderControls.selectOrdering(ORDER_ALPHABETICALLY);
    expect(onOrderChange).not.toHaveBeenCalled();
  });
});
