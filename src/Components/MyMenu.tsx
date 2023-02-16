import React, { FC, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { MdMoreVert } from 'react-icons/md'

export type MenuItem = {
  key:string;
  isLink:boolean;
  title:string;
  label:string;
  href?:string;
  onClick?: ()=>void;
  icon:any;
}

type Props = {
  links: Array<MenuItem>;
}

const MyMenu: FC<Props> = (props) => {
  return (
    <Menu>
      <Menu.Button className="text-esecondary-color rounded-full hover:bg-blue-700 hover:bg-opacity-20 py-2 px-2"><MdMoreVert size={24}/></Menu.Button>
      <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
        <Menu.Items className="fixed pb-2 flex flex-col bg-eprimary-color rounded-md w-56 md:top-[3.2rem] top-9 right-1">
          {props.links.map((link) => (
            /* Use the `active` state to conditionally style the active item. */
            link.isLink ? <Menu.Item key={link.key}>
              {({ active }) => (
                <a
                  title={link.title}
                  href={link.href}
                  className={`flex flex-row gap-2 mx-2 mt-2 p-2 rounded-md duration-300 ${
                    active ? ' text-elight-font-color bg-black bg-opacity-20' : 'text-esecondary-color'
                  }`}
                >
                  {link.icon}<span>{link.label}</span>
                </a>
              )}
            </Menu.Item> :
            <Menu.Item key={link.key}>
              {({ active }) => (
                <button
                  title={link.title}
                  onClick={link.onClick}
                  className={`flex flex-row gap-2 mx-2 mt-2 p-2 rounded-md duration-300 ${
                    active ? ' text-elight-font-color bg-black bg-opacity-20' : 'text-esecondary-color'
                  }`}
                >
                  {link.icon}<span>{link.label}</span>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
        </Transition>
      
    </Menu>
  )
}

export default MyMenu

