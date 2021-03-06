import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import { clone } from '../helpers/objectHelper';
import Index from '../EntryIndex';
import Header from './Header';
import Entries from './Entries';
import Entry from './Entry';
import TopBar from './TopBar';
import { styleIf } from '../helpers/stylesHelper';

import styles from '../styles/Page.less';

const defaultEntry = () => clone({
  site: { type: 'text', value: '' },
  username: { type: 'text', value: '' },
  password: { type: 'password', value: '' },
  other: { type: 'text', value: '' },
});

const Page = (props) => {
  const [space, setSpace] = useState(null);
  const [id, setId] = useState(null);
  const [entry, setEntry] = useState(defaultEntry());
  const index = useMemo(() => new Index(space), [space]);
  const scrollContainer = useRef();

  useEffect(() => {
    scrollContainer.current.scroll({
      top: Math.round(window.innerHeight/2),
      behavior: 'smooth'
    });
  }, [space]);

  const saveEntry = useCallback(async entry => {
    const key = id || uuid();
    await space.private.set(key, entry);
    await index.add(key);
    setId(key);
    setEntry(entry);
  }, [space, id]);

  const deleteEntry = useCallback(async () => {
    if (id != null) {
      await space.private.remove(id);
      await index.remove(id);
      setId(null);
      setEntry(defaultEntry());
    }
  }, [id]);

  const clearEntry = useCallback(() => {
    setId(null);
    setEntry(defaultEntry());
  });

  const pickId = useCallback(id => {
    setId(id);
    space.private.get(id)
      .then(setEntry);
  });

  const containerClassNames = classNames(
    styles.parallaxContainer,
    styleIf(space == null, styles.locked)
  );

  return (
    <>
      <div ref={scrollContainer} className={containerClassNames}>
        <TopBar />
        <Header space={space} setSpace={setSpace} />
        { space != null && (
          <div className={styles.parallaxContent}>
            <main className={styles.content}>
              <section className={styles.leftSide}>
                <button
                    onClick={clearEntry}
                    className={classNames(styles.add, styleIf(id == null, styles.selected))}>
                  + New
                </button>
                <Entries space={space} index={index} id={id} pickId={pickId} />
              </section>
              <section className={styles.rightSide}>
                <Entry
                    id={id}
                    entry={entry}
                    saveEntry={saveEntry}
                    deleteEntry={deleteEntry} />
              </section>
            </main>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(Page);

