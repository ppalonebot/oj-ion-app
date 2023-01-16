import React, { FC, Fragment } from 'react'
import { Menu } from '@headlessui/react'
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
      <Menu.Items className="absolute flex flex-col p-4 bg-eprimary-color rounded-md w-36 right-1 mt-2">
        {links.map((link) => (
          /* Use the `active` state to conditionally style the active item. */
          link.act !== 'logout' ? <Menu.Item key={link.href} as={Fragment}>
            {({ active }) => (
              
              <a
                href={link.href}
                className={` ${
                  active ? ' text-elight-font-color' : ' text-esecondary-color'
                }`}
              >
                {link.label}
              </a>
            )}
          </Menu.Item> :
          <Menu.Item key={link.href} as={Fragment}>
          {({ active }) => (
            
            <button
              title='Sign out from app'
              onClick={props.logout}
              className={`flex flex-row gap-2 ${
                active ? ' text-elight-font-color' : 'text-esecondary-color'
              }`}
            >
              <MdOutlinePowerSettingsNew size={24}/><span>{link.label}</span>
            </button>
          )}
        </Menu.Item>

        ))}
      </Menu.Items>
    </Menu>
  )
}

export default MyMenu

