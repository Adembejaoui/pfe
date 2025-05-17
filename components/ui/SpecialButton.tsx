import React from "react";
import Link from "next/link"; // Remove if not using Next.js

interface SpecialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  text: string;
  className?: string;
  href?: string; // If provided, it will act as a link
  target?: "_blank" | "_self" | "_parent" | "_top"; // For external links
  iconPosition?: "left" | "right"; // Controls the position of the icon
}

const SpecialButton: React.FC<SpecialButtonProps> = ({ 
  icon, 
  text, 
  className, 
  href, 
  target, 
  iconPosition = "left", 
  ...props 
}) => {
  const buttonClass = `flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-white text-sm bg-black text-white shadow-[0px_0px_10px_rgba(255,255,255,0.6)] transition duration-200 ${className}`;

  const content = (
    <>
      {icon && iconPosition === "left" && <span>{icon}</span>}
      {text}
      {icon && iconPosition === "right" && <span>{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} target={target} className={buttonClass}>
        {content}
      </Link>
    );
  }

  return (
    <button className={buttonClass} {...props}>
      {content}
    </button>
  );
};

export default SpecialButton;