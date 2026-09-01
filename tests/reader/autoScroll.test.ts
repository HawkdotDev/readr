import { describe, it, expect, beforeEach } from 'bun:test';
import { useReaderStore } from '../../src/store/readerStore';

describe('Auto-Scroll Suite & Reader Store Phase 3 Features', () => {
  beforeEach(() => {
    const store = useReaderStore.getState();
    store.setAutoScrolling(false);
    store.setAutoScrollSpeed(45);
    store.setAutoScrollMode('smooth');
    store.setPageTimerInterval(20);
    store.setBionicReadingEnabled(false);
    store.setBionicFixation('medium');
    store.setShowSpeedometer(false);
    store.setPageTransition('slide');
  });

  it('toggles and manages auto-scrolling state', () => {
    const store = useReaderStore.getState();
    expect(store.isAutoScrolling).toBe(false);

    store.toggleAutoScroll();
    expect(useReaderStore.getState().isAutoScrolling).toBe(true);

    store.toggleAutoScroll();
    expect(useReaderStore.getState().isAutoScrolling).toBe(false);

    store.setAutoScrolling(true);
    expect(useReaderStore.getState().isAutoScrolling).toBe(true);
  });

  it('clamps auto-scroll speed between 10 and 200 px/sec', () => {
    const store = useReaderStore.getState();
    
    store.setAutoScrollSpeed(80);
    expect(useReaderStore.getState().autoScrollSpeed).toBe(80);

    store.setAutoScrollSpeed(5);
    expect(useReaderStore.getState().autoScrollSpeed).toBe(10);

    store.setAutoScrollSpeed(500);
    expect(useReaderStore.getState().autoScrollSpeed).toBe(200);
  });

  it('switches between auto-scroll modes', () => {
    const store = useReaderStore.getState();

    store.setAutoScrollMode('line');
    expect(useReaderStore.getState().autoScrollMode).toBe('line');

    store.setAutoScrollMode('pageTimer');
    expect(useReaderStore.getState().autoScrollMode).toBe('pageTimer');

    store.setAutoScrollMode('pixel');
    expect(useReaderStore.getState().autoScrollMode).toBe('pixel');
  });

  it('clamps page timer countdown interval between 5s and 120s', () => {
    const store = useReaderStore.getState();

    store.setPageTimerInterval(30);
    expect(useReaderStore.getState().pageTimerIntervalSeconds).toBe(30);

    store.setPageTimerInterval(2);
    expect(useReaderStore.getState().pageTimerIntervalSeconds).toBe(5);

    store.setPageTimerInterval(300);
    expect(useReaderStore.getState().pageTimerIntervalSeconds).toBe(120);
  });

  it('manages Bionic Reading mode and fixation intensity', () => {
    const store = useReaderStore.getState();

    store.setBionicReadingEnabled(true);
    expect(useReaderStore.getState().bionicReadingEnabled).toBe(true);

    store.setBionicFixation('high');
    expect(useReaderStore.getState().bionicFixation).toBe('high');
  });

  it('manages 6 page transition modes and speedometer overlay', () => {
    const store = useReaderStore.getState();

    store.setPageTransition('curl');
    expect(useReaderStore.getState().pageTransition).toBe('curl');

    store.setPageTransition('cover');
    expect(useReaderStore.getState().pageTransition).toBe('cover');

    store.setPageTransition('fade');
    expect(useReaderStore.getState().pageTransition).toBe('fade');

    store.setShowSpeedometer(true);
    expect(useReaderStore.getState().showSpeedometer).toBe(true);
  });
});
