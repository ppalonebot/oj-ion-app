import React, {Fragment} from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface Props {
  title: string
  isDialogOpen: boolean;
  toggleDialog: () => void;
  children?: React.ReactNode;
}

const MyDialog: React.FC<Props> = (props) => {
  return (
  <Transition appear show={props.isDialogOpen} as={Fragment}>
    <Dialog as="div" className="relative z-10 " onClose={props.toggleDialog}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center ">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-200"
              >
                {props.title}
              </Dialog.Title>
              <div className="mt-2">
                {props.children}
              </div>

              <div className="mt-4 w-full flex justify-center">
                <button
                  type="button"
                  className="text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={props.toggleDialog}
                >
                  Got it!
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
  );
}

export default MyDialog;
