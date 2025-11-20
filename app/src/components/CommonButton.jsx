import React from "react";

/**
 * Variantes de estilo
 */
const VARIANT_CLASSES = {
  primary: "bg-[#4DE1E1] text-white shadow-md hover:bg-[#38caca]",
  secondary: "bg-[#FF96DC] text-white shadow-md hover:bg-[#e68fc5]",
  contrastA: "bg-white text-[#4DE1E1] shadow-md hover:bg-gray",
  contrastB: "bg-white text-[#FF96DC] shadow-md hover:bg-gray",
  gradient: "bg-gradient-to-r from-[#4DE1E1] to-[#FF96DC] text-white shadow-md hover:opacity-90",
  link: "inline p-0 mx-0 px-0 bg-transparent text-[#4DE1E1] shadow-none hover:underline",
};

/**
 * Tamaños
 */
const SIZE_CLASSES = {
  sm: "px-3 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

/**
 * CommonButton
 * Props:
 * - children: contenido del botón
 * - variant: primary | secondary | success | danger
 * - size: sm | md | lg
 * - className: clases adicionales
 * - ...props: cualquier otro prop válido de button
 */
const CommonButton = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...props
}) => {
  const combinedClasses = `
    rounded-xl shadow transition transform hover:scale-105
    ${SIZE_CLASSES[size]}
    ${VARIANT_CLASSES[variant]}
    ${className}
  `.trim().replace(/\s+/g, " ");

  const Component = href ? "a" : "button";

  return (
    <Component className={combinedClasses} href={href} {...props}>
      {children}
    </Component>
  );
};

export default CommonButton;