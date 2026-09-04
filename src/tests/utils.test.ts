import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toFormFieldName } from '../utils/to-form-field-name';

describe('toFormFieldName utility', () => {
    it('normalizes simple label to lowercase snake_case', () => {
        assert.equal(toFormFieldName('First Name'), 'first_name');
        assert.equal(toFormFieldName('Email Address'), 'email_address');
    });

    it('replaces special characters with single underscores', () => {
        assert.equal(toFormFieldName('What is your name? (#1)'), 'what_is_your_name_1');
        assert.equal(toFormFieldName('Phone / Mobile - Number'), 'phone_mobile_number');
    });

    it('prefixes leading numbers with field_', () => {
        assert.equal(toFormFieldName('123 Field'), 'field_123_field');
        assert.equal(toFormFieldName('1st Choice'), 'field_1st_choice');
    });

    it('handles empty or blank strings with fallback', () => {
        assert.equal(toFormFieldName(''), 'field');
        assert.equal(toFormFieldName('   '), 'field');
        assert.equal(toFormFieldName('---'), 'field');
    });

    it('trims leading and trailing underscores', () => {
        assert.equal(toFormFieldName('_some_name_'), 'some_name');
        assert.equal(toFormFieldName('___title___'), 'title');
    });
});
