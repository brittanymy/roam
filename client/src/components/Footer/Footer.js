import React from "react";
// import Box from "@mui/material/Box";
// import ItemsContainer from "./ItemsContainer";
// import SocialIcons from "./SocialIcons";
// import { Icons } from "./Menus";
// import BottomNavigation from "@mui/material/BottomNavigation";
// import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* <ItemsContainer />
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10
      text-center pt-2 text-gray-400 text-sm pb-8"
      > */}
      <span>© 2022 Roam. All rights reserved.</span>
      <span>Terms · Privacy Policy</span>
      {/* <SocialIcons Icons={Icons} /> */}
      {/* </div> */}
    </footer>
  );
};

export default Footer;
