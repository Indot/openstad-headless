import React, { useContext } from 'react';
import '../index.css';
import { useState } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import CommentForm from './comment-form.js';
import { DropDownMenu } from '@openstad-headless/ui/src';
import hasRole from '../../../lib/has-role';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Paragraph, Heading6, Button, ButtonGroup } from "@utrecht/component-library-react";
import { CommentProps } from '../types/comment-props';
import { CommentWidgetContext } from '../comments';

function Comment({
  comment = {
    id: 0,
    delete(arg) {
      throw new Error('Not implemented');
    },
    submitLike() {
      throw new Error('Not implemented');
    },
  },
  showDateSeperately = false,
  ...props
}: CommentProps) {
  const widgetContext = useContext(CommentWidgetContext);

  const args = {
    comment,
    ...props,
  } as CommentProps;

  const datastore = new DataStore(args);
  const { data: currentUser } = datastore.useCurrentUser({ ...args });
  const [isReplyFormActive, setIsReplyFormActive] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  function toggleReplyForm() {
    // todo: scrollto
    setIsReplyFormActive(!isReplyFormActive);
  }

  function toggleEditForm() {
    setEditMode(!editMode);
  }

  function canReply() {
    if (!widgetContext || !widgetContext.canComment) return false;
    if (!widgetContext.canReply) return false; // widget setting
    return args.comment.can && args.comment.can.reply;
  }

  function canLike() {
    if (!widgetContext || !widgetContext.canComment) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return hasRole(currentUser, widgetContext.requiredUserRole);
  }

  function canEdit() {
    if (!widgetContext || !widgetContext.canComment) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return args.comment.can && args.comment.can.edit;
  }

  function canDelete() {
    if (!widgetContext || !widgetContext.canComment) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return args.comment.can && args.comment.can.delete;
  }

  if(!widgetContext) {
    return null;
  }

  return (
    <article className='comment-item'>
      <section className="comment-item-header">
        <Heading6 className="reaction-name">
          {args.comment.user && args.comment.user.displayName}{' '}
        </Heading6>
        {canEdit() || canDelete() ? (
          <DropDownMenu
            items={[
              { label: 'Bewerken', onClick: () => toggleEditForm() },
              {
                label: 'Verwijderen',
                onClick: () => {
                  if (args.comment && confirm('Weet u het zeker?'))
                    args.comment.delete(args.comment.id);
                },
              },
            ]}>
            <Button appearance="subtle-button">
              <div>
                <i className="ri-more-fill"></i>
                <span className="sr-only"></span>
              </div>
            </Button>
          </DropDownMenu>
        ) : null}
      </section>

      {editMode ? (
        <CommentForm
          {...args}
          placeholder={widgetContext.placeholder}
          comment={args.comment}
          submitComment={(e) => {
            if(props.submitComment) {
              props.submitComment(e);
            }
            toggleEditForm();
          }}
        />
      ) : (
        <>
          <Spacer size={0.25} />
          <Paragraph className="comment-reaction-text">{args.comment.description}</Paragraph>
          <Spacer size={0.25} />
          {showDateSeperately && (
            <Paragraph className="comment-reaction-strong-text">
              {args.comment.createDateHumanized}
            </Paragraph>
          )}
        </>
      )}
      {!args.comment.parentId && (
        <section className="comment-item-footer">
          <Paragraph className="comment-reaction-strong-text">
            {args.comment.createDateHumanized}
          </Paragraph>
          <ButtonGroup>
            {widgetContext.canLike && (
              canLike() ? (
                <Button
                  appearance='secondary-action-button'
                  className={args.comment.hasUserVoted ? `active` : ''}
                  onClick={() => args.comment.submitLike()}>
                  <i className={args.comment.hasUserVoted ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'}></i>
                  Mee eens (<span>{args.comment.yes || 0}</span>)
                </Button>
              ) : (
                <Button disabled>
                  <i className="ri-thumb-up-line"></i>
                  Mee eens (<span>{args.comment.yes || 0}</span>)
                </Button>
              )
            )}
            {canReply() ? (
              <Button 
                appearance='primary-action-button'
                onClick={() => toggleReplyForm()}>
                Reageren
              </Button>
            ) : null }
          </ButtonGroup>
        </section>
      )}

      <Spacer size={1} />

      {args.comment.replies &&
        args.comment.replies.map((reply, index) => {
          return (
            <div className="reaction-container" key={index}>
              <Comment {...args} showDateSeperately={true} comment={reply} />
            </div>
          );
        })}

      {isReplyFormActive ? (
        <div className="reaction-container">
          <div className="input-container">
            <CommentForm
              {...args}
              formIntro="Reageer op deze reactie"
              placeholder={widgetContext.placeholder}
              parentId={args.comment.id}
              // hideReplyAsAdmin={true}
              submitComment={(e) => {
                if(props.submitComment) {
                  props.submitComment(e);
                }
                toggleReplyForm();
              }}
            />
            <Spacer size={1} />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export { Comment as default, Comment };
