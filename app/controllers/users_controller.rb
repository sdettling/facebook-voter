class UsersController < ApplicationController
  def create
    @user = User.new(params[:user])
    respond_to do |format|
      if @user.save
        format.json { render json: @user }
      else
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end
end
