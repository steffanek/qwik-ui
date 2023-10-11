import {
  $,
  component$,
  QRL,
  QwikIntrinsicElements,
  QwikMouseEvent,
  Signal,
  Slot,
  useContextProvider,
  useSignal,
  useTask$,
} from '@builder.io/qwik';
import { createFocusTrap, FocusTrap } from 'focus-trap';
import { modalContextId } from './modal-context-id';
import { ModalContext } from './modal-context.type';

export type ModalProps = Omit<QwikIntrinsicElements['dialog'], 'open'> & {
  onShow$?: QRL<() => void>;
  onHide$?: QRL<() => void>;
  show?: boolean;
  'bind:show'?: Signal<boolean>;
};

export const Modal = component$((props: ModalProps) => {
  const modalRef = useSignal<HTMLDialogElement>();

  const { 'bind:show': givenOpenSig, show: givenShow, onShow$, onHide$ } = props;
  const defaultOpenSig = useSignal(false);
  const showSig = givenOpenSig || defaultOpenSig;

  useTask$(async function syncOpenProp({ track }) {
    const openPropValue = track(() => givenShow);

    showSig.value = openPropValue || false;
  });

  useTask$(async function toggleModal({ track, cleanup }) {
    const isOpen = track(() => showSig.value);
    const modal = modalRef.value;

    if (!modal) return;

    let focusTrap: FocusTrap | null = createFocusTrap(modal, {
      escapeDeactivates: false,
    });

    if (isOpen) {
      // open modal
      modal.showModal();
      await props.onShow$?.();

      // focus lock
      focusTrap.activate();

      // scroll lock
      window.document.body.style.overflow = 'hidden';

      // prevents scrollbar flickers
      let scrollbarWidth: number | null = null;
      if (scrollbarWidth === null) {
        scrollbarWidth = window.innerWidth - document.body.offsetWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      await props.onHide$?.();
      modal.close();
    }

    cleanup(() => {
      focusTrap?.deactivate();
      focusTrap = null;

      // back to scroll
      window.document.body.style.overflow = '';
    });
  });

  const closeOnBackdropClick$ = $((event: QwikMouseEvent) => {
    const modal = modalRef.value;

    if (!modal) {
      return;
    }

    const modalRect = modal.getBoundingClientRect();

    const wasClickTriggeredOutsideModalRect =
      modalRect.left > event.clientX ||
      modalRect.right < event.clientX ||
      modalRect.top > event.clientY ||
      modalRect.bottom < event.clientY;

    if (wasClickTriggeredOutsideModalRect) {
      showSig.value = false;
    }
  });

  const context: ModalContext = {
    showSig,
    handler: { onShow$, onHide$ },
  };

  useContextProvider(modalContextId, context);

  return (
    <dialog
      {...props}
      ref={modalRef}
      onClick$={(event) => closeOnBackdropClick$(event)}
      onClose$={() => (showSig.value = false)}
    >
      <Slot />
    </dialog>
  );
});
