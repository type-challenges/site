// https://github.com/typescript-exercises/typescript-exercises/blob/main/src/components/auto-resizer/index.tsx
import debounce from 'lodash.debounce';
import React, { useEffect, useRef, useState } from 'react';

type PropsWithSize<T> = T & {
  width?: string | number;
  height?: string | number;
};

export default function withAutoResize<T>(
  Component: React.ComponentType<PropsWithSize<T>>,
): React.ComponentType<PropsWithSize<T>> {
  return function (props: T) {
    const [size, setSize] = useState({ width: '100%', height: '100%' });
    const wrapperRef = useRef<HTMLDivElement>(null);
    useEffect(
      function () {
        const updateSize = debounce(function () {
          setSize(size => {
            if (!wrapperRef.current) {
              return size;
            }
            const newWidth = `${wrapperRef.current.offsetWidth}px`;
            const newHeight = `${wrapperRef.current.offsetHeight}px`;
            if (size.width === newWidth && size.height === newHeight) {
              return size;
            }
            return {
              width: newWidth,
              height: newHeight,
            };
          });
        }, 100);
        window.addEventListener('resize', updateSize, { passive: true });
        const interval = setInterval(updateSize, 200);
        return function () {
          window.removeEventListener('resize', updateSize);
          clearInterval(interval);
        };
      },
      [wrapperRef],
    );
    return (
      <div
        ref={wrapperRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          overflow: 'hidden',
        }}
      >
        <Component {...props} {...size} />
      </div>
    );
  };
}
