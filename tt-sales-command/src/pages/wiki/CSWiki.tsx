import React from 'react';
import { WikiPage } from './WikiPage';
import { csWikiData } from '../../data/csWiki';

export default function CSWiki() {
  return <WikiPage title="CS & Implementation Wiki" data={csWikiData} />;
}
