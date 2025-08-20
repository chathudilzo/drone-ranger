import React from "react";

const NavBar = () => {
  return (
    <div className="flex flex-row justify-between items-center px-16 py-4">
      <div>
        <h5>Drone Ranger</h5>
      </div>
      <ul className="flex flex-row justify-between items-center gap-5 text-gray-500">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        <li>
          <a href="/contact">Contact</a>
        </li>
      </ul>
    </div>
  );
};

export default NavBar;
