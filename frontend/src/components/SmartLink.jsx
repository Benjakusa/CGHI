import React from 'react';
import { Link } from 'react-router-dom';

const EXTERNAL = /^(https?:)?\/\//i;
const PROTOCOL = /^(mailto:|tel:|sms:)/i;
const DOCUMENT_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|xlsx?)($|\?)/i;

const STATIC_PATHS = [/^\/downloads\//, /^\/assets\//i, /^\/og\//];

function isDocumentPath(path) {
  return DOCUMENT_EXT.test(path) || STATIC_PATHS.some((re) => re.test(path));
}

export default function SmartLink({
  to,
  href,
  children,
  className,
  onClick,
  ...rest
}) {
  const target = to ?? href ?? '/';

  if (EXTERNAL.test(target)) {
    return (
      <a
        href={target}
        className={className}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  if (PROTOCOL.test(target)) {
    return (
      <a href={target} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  if (target.startsWith('#')) {
    return (
      <a href={target} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  if (isDocumentPath(target.split('#')[0].split('?')[0])) {
    return (
      <a href={target} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={target} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
