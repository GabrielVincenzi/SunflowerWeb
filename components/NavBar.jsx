import React from 'react'
import { navlinks } from '../constants/index.js'

function NavBar() {
    return (
        <nav>
            <div>
                <a href='#home' className='flex items-center gap-2'>
                    <p>SunFlower</p>
                </a>

                <ul>
                    {navlinks.map((link) => (
                        <li key={link.id}>
                            <a href={`#{link.id}`}>{link.title}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}

export default NavBar;