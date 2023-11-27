import './resource-overview.css';
import React from 'react';
import { Banner, Icon } from '@openstad-headless/ui/src';
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { BaseConfig } from '../../generic-widget-types';
import { Filters } from './filters/filters';

type Props = {
  renderHeader?: (resources?: Array<any>) => React.JSX.Element;
  renderItem?: (resource: any) => React.JSX.Element;
  allowFiltering?: boolean;
  tagTypes?: Array<{
    type: string;
    placeholder: string;
    multiple?: boolean;
  }>;
} & BaseConfig;

//Temp: Header can only be made when the map works so for now a banner
// If you dont want a banner pas <></> into the renderHeader prop
const defaultHeaderRenderer = (resources?: any) => {
  return (
    <>
      <Banner>
        <Spacer size={12} />
      </Banner>
      <section className="osc-resource-overview-title-container">
        <Spacer size={2} />
        <h4>Plannen</h4>
      </section>
    </>
  );
};

const defaultItemRenderer = (resource: any) => {
  return (
    <article>
      <Image
        src={resource.images?.at(0)?.src || ''}
        onClick={() => console.log({ resource })}
        imageFooter={
          <div>
            <p className="osc-resource-overview-content-item-status">
              {resource.status === 'OPEN' ? 'Open' : 'Gesloten'}
            </p>
          </div>
        }
      />
      <div>
        <Spacer size={1} />
        <h6>{resource.title}</h6>
        <p className="osc-resource-overview-content-item-description">
          {resource.description}
        </p>
      </div>
      <div className="osc-resource-overview-content-item-footer">
        <Icon icon="ri-thumb-up-line" variant="big" text={resource.yes} />
        <Icon icon="ri-thumb-down-line" variant="big" text={resource.yes} />
        <Icon icon="ri-message-line" variant="big" text="0" />
      </div>
    </article>
  );
};

function ResourceOverview({
  renderHeader = defaultHeaderRenderer,
  renderItem = defaultItemRenderer,
  allowFiltering = true,
  tagTypes = [],
  ...props
}: Props) {
  const datastore = new DataStore(props);
  const [ideas] = datastore.useIdeas({ ...props });

  return (
    <div className="osc">
      {renderHeader()}

      <Spacer size={2} />

      <section
        className={`osc-resource-overview-content ${
          !allowFiltering ? 'full' : ''
        }`}>
        {allowFiltering && datastore ? (
          <Filters
            projectId={props.projectId}
            config={props.config}
            dataStore={datastore}
            ideas={ideas}
            onUpdateFilter={ideas.filter}
            tagTypes={tagTypes}
          />
        ) : null}

        <section className="osc-resource-overview-resource-collection">
          {ideas &&
            ideas.map((resource: any) => {
              return (
                <React.Fragment key={`resource-item-${resource.title}`}>
                  {renderItem(resource)}
                </React.Fragment>
              );
            })}
        </section>
      </section>
    </div>
  );
}

export default ResourceOverview;