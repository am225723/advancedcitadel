export const getTouchPosition = (e, element) => {
  const rect = element.getBoundingClientRect();
  
  let clientX, clientY;
  
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  
  return { x, y, clientX, clientY };
};

export const createTouchHandler = (touchHandler, mouseHandler) => {
  return (e) => {
    if (e.type.startsWith('touch')) {
      e.preventDefault();
      if (touchHandler) touchHandler(e);
    } else if (mouseHandler) {
      mouseHandler(e);
    }
  };
};

export const preventTouchScroll = (e) => {
  if (e.cancelable) {
    e.preventDefault();
  }
};
