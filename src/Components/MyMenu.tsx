import React, { FC, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { MdMoreVert, MdOutlinePowerSettingsNew } from 'react-icons/md'

const links = [
  { act: 'logout', href: "", label: 'Sign out' },
]

type Props = {
  logout: ()=> void
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
        <Menu.Items className="absolute pb-2 flex flex-col bg-eprimary-color rounded-md w-56 right-1 mt-24 md:mt-28">
          {links.map((link) => (
            /* Use the `active` state to conditionally style the active item. */
            link.act !== 'logout' ? <Menu.Item key={link.href}>
              {({ active }) => (
                <a
                  href={link.href}
                  className={`m-2 p-2 ${
                    active ? ' text-elight-font-color' : ' text-esecondary-color'
                  }`}
                >
                  {link.label}
                </a>
              )}
            </Menu.Item> :
            <Menu.Item key={link.href}>
              {({ active }) => (
                
                <button
                  title='Sign out from app'
                  onClick={props.logout}
                  className={`flex flex-row gap-2 mx-2 mt-2 p-2 rounded-md duration-300 ${
                    active ? ' text-elight-font-color bg-black bg-opacity-20' : 'text-esecondary-color'
                  }`}
                >
                  <MdOutlinePowerSettingsNew size={24}/><span>{link.label}</span>
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

