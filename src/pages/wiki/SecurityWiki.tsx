import React from 'react';
import { WikiPage } from './WikiPage';
import { securityWikiData } from '../../data/securityWiki';

export default function SecurityWiki() {
  return <WikiPage title="Security, Compliance & Trust" data={securityWikiData} />;
}
